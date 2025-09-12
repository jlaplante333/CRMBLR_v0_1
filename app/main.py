import os
from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from .search import es_client, ensure_index, search_products, get_index_name, recent_products, count_products
from .auth import (
    ensure_users_index,
    require_user,
    issue_jwt,
    upsert_user_from_google,
    find_user_by_email,
    create_user_email,
    verify_password,
)
import json
import time
from collections import deque
import requests
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests


app = FastAPI(title="CRMBLR")

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")
templates.env.auto_reload = True
if "tojson" not in templates.env.filters:
    templates.env.filters["tojson"] = lambda v, indent=None: json.dumps(v, indent=indent, ensure_ascii=False)
if "human_tool" not in templates.env.filters:
    def _human_tool(name: str) -> str:
        mapping = {
            "list_collections": "List Collections",
            "list_docs": "List Documents",
            "search_docs": "Search Documents",
            "create_doc": "Create Document",
            "get_doc": "Get Document",
            "update_doc": "Update Document",
            "delete_doc": "Delete Document",
        }
        if not name:
            return "Event"
        return mapping.get(name, str(name).replace("_", " ").title())
    templates.env.filters["human_tool"] = _human_tool
if "humants" not in templates.env.filters:
    import datetime as _dt
    def _humants(ts: float) -> str:
        try:
            return _dt.datetime.fromtimestamp(float(ts)).strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            return ""
    templates.env.filters["humants"] = _humants

# --- Simple in-memory event buffer for UI panel ---
events = deque(maxlen=200)
_eid = 0


def _next_event_id():
    global _eid
    _eid += 1
    return _eid


def record_event(**e):
    evt = {
        "id": _next_event_id(),
        "ts": time.time(),
        **e,
    }
    events.append(evt)
    return evt


@app.on_event("startup")
def on_startup():
    ensure_index()
    try:
        ensure_users_index()
    except Exception:
        # If ES not ready, we still let the app start
        pass


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    # Workspace is the main app; client-side script ensures auth and redirects if missing
    return templates.TemplateResponse(
        "split.html",
        {"request": request},
    )


@app.get("/search", response_class=HTMLResponse)
def search(request: Request, q: str = ""):
    hits = []
    if q.strip():
        hits = search_products(q)
    return templates.TemplateResponse(
        "_results.html",
        {"request": request, "hits": hits, "hits_json": json.dumps(hits)},
    )


@app.get("/workspace", response_class=HTMLResponse)
def workspace(request: Request):
    return templates.TemplateResponse(
        "split.html",
        {"request": request},
    )


# --- Tables (CRUD UI) ---
@app.get("/tables", response_class=HTMLResponse)
def tables_page(request: Request):
    # Page loads; HTMX requests fetch data with Authorization header from localStorage
    return templates.TemplateResponse("tables.html", {"request": request})


@app.get("/ui/tables/collections", response_class=HTMLResponse)
def ui_tables_collections(request: Request, user=Depends(require_user)):
    sub = user.get("sub") or user.get("email") or "anon"
    prefix = f"users-{sub}-"
    collections = []
    try:
        infos = es_client.indices.get(index=f"{prefix}*")
        for idx in infos.keys():
            if idx.startswith(prefix):
                collections.append(idx[len(prefix):])
    except Exception:
        collections = []
    return templates.TemplateResponse("tables/collections.html", {"request": request, "collections": sorted(collections)})


@app.get("/ui/tables/{collection}", response_class=HTMLResponse)
def ui_tables_collection_docs(request: Request, collection: str, user=Depends(require_user)):
    index = _user_index(user, collection)
    hits = []
    columns = []
    try:
        if es_client.indices.exists(index=index):
            res = es_client.search(index=index, body={"query": {"match_all": {}}}, size=50)
            hits = res.get("hits", {}).get("hits", [])
            # Infer columns from sources
            cols = []
            seen = set()
            for h in hits:
                src = h.get("_source") or {}
                for k in src.keys():
                    if k.startswith("_"):
                        continue
                    if k not in seen:
                        seen.add(k)
                        cols.append(k)
            columns = cols
    except Exception:
        hits = []
        columns = []
    return templates.TemplateResponse("tables/docs_table.html", {"request": request, "collection": collection, "hits": hits, "columns": columns})


@app.get("/ui/tables/{collection}/new", response_class=HTMLResponse)
def ui_tables_new_doc(request: Request, collection: str, user=Depends(require_user)):
    return templates.TemplateResponse("tables/doc_form.html", {"request": request, "collection": collection, "title": f"New document in '{collection}'", "action": f"/ui/tables/{collection}", "value": "{\n  \"name\": \"\",\n  \"status\": \"\"\n}", "doc_id": None})


@app.post("/ui/tables/{collection}")
async def ui_tables_create_doc(request: Request, collection: str, user=Depends(require_user)):
    form = await request.form()
    doc_json = form.get("doc_json") or "{}"
    try:
        doc = json.loads(doc_json)
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)
    index = _user_index(user, collection)
    es_client.index(index=index, document=doc, refresh="wait_for")
    # Return refreshed table
    return ui_tables_collection_docs(request, collection, user)


@app.get("/ui/tables/{collection}/{doc_id}/edit", response_class=HTMLResponse)
def ui_tables_edit_doc(request: Request, collection: str, doc_id: str, user=Depends(require_user)):
    index = _user_index(user, collection)
    doc = {}
    try:
        res = es_client.get(index=index, id=doc_id)
        doc = res.get("_source") or {}
    except Exception:
        doc = {}
    return templates.TemplateResponse("tables/doc_form.html", {"request": request, "collection": collection, "title": f"Edit document {doc_id}", "action": f"/ui/tables/{collection}/{doc_id}", "value": json.dumps(doc, indent=2), "doc_id": doc_id})


@app.post("/ui/tables/{collection}/{doc_id}")
async def ui_tables_update_doc(request: Request, collection: str, doc_id: str, user=Depends(require_user)):
    form = await request.form()
    doc_json = form.get("doc_json") or "{}"
    try:
        doc = json.loads(doc_json)
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)
    index = _user_index(user, collection)
    # Merge/replace fields via update
    es_client.update(index=index, id=doc_id, body={"doc": doc}, refresh="wait_for")
    return ui_tables_collection_docs(request, collection, user)


@app.delete("/ui/tables/{collection}/{doc_id}")
def ui_tables_delete_doc(request: Request, collection: str, doc_id: str, user=Depends(require_user)):
    index = _user_index(user, collection)
    try:
        es_client.delete(index=index, id=doc_id, refresh="wait_for")
    except Exception:
        pass
    # HTMX expects HTML; return refreshed table
    return ui_tables_collection_docs(request, collection, user)


@app.get("/ui/events", response_class=HTMLResponse)
def ui_events(request: Request):
    # Newest first for display
    data = list(reversed(events))
    return templates.TemplateResponse(
        "partials/events_cards.html",
        {"request": request, "events": data},
    )


@app.get("/token")
def mint_ephemeral_token(user=Depends(require_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return JSONResponse({"error": "OPENAI_API_KEY not configured"}, status_code=500)
    # Load instructions from file, if present
    instr_path = os.getenv("INSTRUCTION_FILE", os.path.join(os.path.dirname(__file__), "instruction.md"))
    instructions = None
    try:
        with open(instr_path, "r", encoding="utf-8") as f:
            instructions = f.read()
    except Exception:
        instructions = None

    # Define basic function tools available to the session from the start
    tools = [
        {
            "type": "function",
            "name": "list_collections",
            "description": "List collection names for the current user",
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
        {
            "type": "function",
            "name": "list_docs",
            "description": "List documents in a collection",
            "parameters": {
                "type": "object",
                "properties": {
                    "collection": {"type": "string"},
                    "query": {"type": "object"},
                    "size": {"type": "integer"},
                    "from": {"type": "integer"},
                },
                "required": ["collection"],
                "additionalProperties": True,
            },
        },
        {
            "type": "function",
            "name": "search_docs",
            "description": "Search documents with conditions across one or more collections",
            "parameters": {
                "type": "object",
                "properties": {
                    "collections": {"type": "array", "items": {"type": "string"}},
                    "collection": {"type": "string"},
                    "q": {"type": "string", "description": "Free-text query"},
                    "where": {
                        "type": "object",
                        "properties": {
                            "all": {"type": "array", "items": {"type": "object"}},
                            "any": {"type": "array", "items": {"type": "object"}},
                            "none": {"type": "array", "items": {"type": "object"}},
                            "filters": {"type": "array", "items": {"type": "object"}}
                        },
                        "additionalProperties": True
                    },
                    "size": {"type": "integer", "default": 50},
                    "from": {"type": "integer", "default": 0},
                    "sort": {"type": "array", "items": {"type": "object"}},
                    "fields": {"type": "array", "items": {"type": "string"}},
                    "aggs": {"type": "object"},
                    "highlight": {"type": "object"}
                },
                "additionalProperties": True
            }
        },
        {
            "type": "function",
            "name": "create_doc",
            "description": "Create a document in a collection",
            "parameters": {
                "type": "object",
                "properties": {
                    "collection": {"type": "string"},
                    "doc": {"type": "object"},
                },
                "required": ["collection", "doc"],
                "additionalProperties": True,
            },
        },
        {
            "type": "function",
            "name": "get_doc",
            "description": "Get a document by id",
            "parameters": {
                "type": "object",
                "properties": {
                    "collection": {"type": "string"},
                    "id": {"type": "string"},
                },
                "required": ["collection", "id"],
            },
        },
        {
            "type": "function",
            "name": "update_doc",
            "description": "Update a document by id (merge fields)",
            "parameters": {
                "type": "object",
                "properties": {
                    "collection": {"type": "string"},
                    "id": {"type": "string"},
                    "doc": {"type": "object"},
                },
                "required": ["collection", "id", "doc"],
                "additionalProperties": True,
            },
        },
        {
            "type": "function",
            "name": "delete_doc",
            "description": "Delete a document by id",
            "parameters": {
                "type": "object",
                "properties": {
                    "collection": {"type": "string"},
                    "id": {"type": "string"},
                },
                "required": ["collection", "id"],
            },
        },
    ]

    session_config = {
        "session": {
            "type": "realtime",
            "model": "gpt-realtime",
            "audio": {"output": {"voice": "marin"}},
            "tools": tools,
            "tool_choice": "auto",
            **({"instructions": instructions} if instructions else {}),
        }
    }
    try:
        resp = requests.post(
            "https://api.openai.com/v1/realtime/client_secrets",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=session_config,
            timeout=10,
        )
        return Response(resp.text, status_code=resp.status_code, media_type="application/json")
    except requests.RequestException as e:
        return JSONResponse({"error": "Failed to generate token"}, status_code=500)


def _user_index(user: dict, collection: str) -> str:
    sub = user.get("sub") or user.get("email") or "anon"
    safe = (collection or "default").strip().lower()
    return f"users-{sub}-{safe}"


@app.post("/tool")
def execute_tool(payload: dict, user=Depends(require_user)):
    name = payload.get("name")
    args = payload.get("arguments") or {}
    try:
        # Log start of tool execution
        record_event(tool=name, phase="started", request=args)
        if name == "list_collections":
            sub = user.get("sub") or user.get("email") or "anon"
            prefix = f"users-{sub}-"
            collections = []
            try:
                infos = es_client.indices.get(index=f"{prefix}*")
                for idx in infos.keys():
                    if idx.startswith(prefix):
                        collections.append(idx[len(prefix):])
            except Exception:
                collections = []
            res = {"collections": sorted(collections)}
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        elif name == "search_docs":
            # Multi-collection, condition-based search translated to ES DSL
            cols = args.get("collections") or ([] if args.get("collection") is None else [args.get("collection")])
            indices = []
            for c in cols:
                if not c:
                    continue
                indices.append(_user_index(user, c))
            if not indices:
                # If nothing specified, default to a generic collection
                indices = [_user_index(user, "default")]

            # Build query from 'where' and 'q'
            def _to_clause(cond):
                try:
                    field = cond.get("field")
                    op = (cond.get("op") or "eq").lower()
                    value = cond.get("value")
                    values = cond.get("values")
                    if op in ("eq", "term") and field is not None:
                        return {"term": {field: value}}
                    if op in ("in", "terms") and field is not None:
                        return {"terms": {field: values if isinstance(values, list) else [value]}}
                    if op in ("match",):
                        return {"match": {field: value}}
                    if op in ("phrase", "match_phrase"):
                        return {"match_phrase": {field: value}}
                    if op in ("contains", "wildcard"):
                        # Wrap value with wildcards if not already present
                        v = str(value or "")
                        if "*" not in v and "?" not in v:
                            v = f"*{v}*"
                        return {"wildcard": {field: v}}
                    if op == "prefix":
                        return {"prefix": {field: value}}
                    if op in ("gt", "gte", "lt", "lte", "range"):
                        rng = {}
                        for k in ("gt", "gte", "lt", "lte"):
                            if cond.get(k) is not None:
                                rng[k] = cond.get(k)
                        if field is None:
                            return {"range": {"_id": rng}}  # fallback; should specify field
                        return {"range": {field: rng}}
                    if op == "exists":
                        return {"exists": {"field": field}}
                    if op == "missing":
                        return {"bool": {"must_not": [{"exists": {"field": field}}]}}
                    # Fallback: query_string on field
                    if field:
                        return {"query_string": {"query": str(value or ""), "default_field": field}}
                    return {"match_all": {}}
                except Exception:
                    return {"match_all": {}}

            where = args.get("where") or {}
            must = [ _to_clause(c) for c in (where.get("all") or []) ]
            should = [ _to_clause(c) for c in (where.get("any") or []) ]
            must_not = [ _to_clause(c) for c in (where.get("none") or []) ]
            filters = [ _to_clause(c) for c in (where.get("filters") or []) ]

            qfree = (args.get("q") or "").strip()
            if qfree:
                # Use simple_query_string over all fields
                must.insert(0, {"simple_query_string": {"query": qfree, "default_operator": "and"}})

            bool_q = {k: v for k, v in (
                ("must", must),
                ("should", should),
                ("must_not", must_not),
                ("filter", filters),
            ) if v }
            if should:
                bool_q["minimum_should_match"] = 1

            body = {"query": {"bool": bool_q or {"must": [{"match_all": {}}]}}}

            size = int(args.get("size") or 50)
            frm = int(args.get("from") or 0)
            size = max(1, min(size, 500))
            if args.get("fields"):
                body["_source"] = {"includes": list(args.get("fields") or [])}
            if args.get("aggs"):
                body["aggs"] = args.get("aggs")
            if args.get("highlight"):
                body["highlight"] = args.get("highlight")
            sort = []
            for s in (args.get("sort") or []):
                if isinstance(s, dict) and s.get("field"):
                    sort.append({s["field"]: {"order": (s.get("order") or "desc").lower()}})
            if sort:
                body["sort"] = sort

            # Only search indices that exist to avoid raising
            indices_existing = [idx for idx in indices if es_client.indices.exists(index=idx)]
            if not indices_existing:
                res = {"hits": {"total": 0, "hits": []}}
                record_event(tool=name, phase="ok", request=args, response=res)
                return {"ok": True, "result": res}

            res = es_client.search(index=",".join(indices_existing), body=body, size=size, from_=frm)

            # Optional relationship expansion
            try:
                expand = args.get("expand") or []
                if expand and isinstance(res.get("hits", {}).get("hits", []), list):
                    hits = res["hits"]["hits"]
                    for exp in expand:
                            name_key = exp.get("name") or exp.get("as") or "rel"
                            rel_collection = exp.get("collection")
                            from_field = exp.get("from")
                            to_field = exp.get("to") or "id"
                            many = bool(exp.get("many"))
                            if not rel_collection or not from_field:
                                continue
                            target_index = _user_index(user, rel_collection)
                            if not es_client.indices.exists(index=target_index):
                                continue
                            # Gather unique ids to fetch (cap to avoid huge queries)
                            ids = []
                            for h in hits:
                                src = h.get("_source", {})
                                v = src.get(from_field)
                                if v is None:
                                    continue
                                if isinstance(v, list):
                                    ids.extend([x for x in v if x is not None])
                                else:
                                    ids.append(v)
                            uniq = []
                            seen = set()
                            for x in ids:
                                if x in seen:
                                    continue
                                seen.add(x)
                                uniq.append(x)
                                if len(uniq) >= 500:
                                    break
                            if not uniq:
                                # attach empty structures
                                for h in hits:
                                    h.setdefault("_rel", {})[name_key] = ([] if many else None)
                                continue
                            q = {"query": {"terms": {to_field: uniq}}, "size": len(uniq)}
                            if exp.get("fields"):
                                q["_source"] = {"includes": list(exp.get("fields") or [])}
                            rel = es_client.search(index=target_index, body=q)
                            rel_hits = rel.get("hits", {}).get("hits", [])
                            by_key = {}
                            for rh in rel_hits:
                                src = rh.get("_source", {})
                                key = src.get(to_field)
                                if key is None:
                                    continue
                                # also surface the ES id
                                if "id" not in src:
                                    src = {**src, "id": rh.get("_id")}
                                by_key[key] = src
                            # Attach to each hit
                            for h in hits:
                                src = h.get("_source", {})
                                v = src.get(from_field)
                                if many:
                                    out = []
                                    for k in (v or []):
                                        if k in by_key:
                                            out.append(by_key[k])
                                    h.setdefault("_rel", {})[name_key] = out
                                else:
                                    h.setdefault("_rel", {})[name_key] = by_key.get(v)
                    # end for exp
            except Exception:
                # Relationship expansion is best effort; ignore failures
                pass
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        elif name == "list_docs":
            collection = args.get("collection")
            index = _user_index(user, collection)
            size = int(args.get("size") or 50)
            frm = int(args.get("from") or 0)
            query = args.get("query") or {"match_all": {}}
            if not es_client.indices.exists(index=index):
                res = {"hits": {"total": 0, "hits": []}}
                record_event(tool=name, phase="ok", request=args, response=res)
                return {"ok": True, "result": res}
            res = es_client.search(index=index, body={"query": query}, size=size, from_=frm)
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        elif name == "create_doc":
            collection = args.get("collection")
            index = _user_index(user, collection)
            doc = args["doc"]
            res = es_client.index(index=index, document=doc, refresh="wait_for")
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        elif name == "get_doc":
            collection = args.get("collection")
            index = _user_index(user, collection)
            _id = args["id"]
            res = es_client.get(index=index, id=_id)
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        elif name == "update_doc":
            collection = args.get("collection")
            index = _user_index(user, collection)
            _id = args["id"]
            doc = args["doc"]
            # Upsert-like behavior via index overwrite
            source = es_client.get(index=index, id=_id).get("_source", {})
            source.update(doc)
            res = es_client.index(index=index, id=_id, document=source, refresh="wait_for")
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        elif name == "delete_doc":
            collection = args.get("collection")
            index = _user_index(user, collection)
            _id = args["id"]
            res = es_client.delete(index=index, id=_id, ignore=[404], refresh="wait_for")
            record_event(tool=name, phase="ok", request=args, response=res)
            return {"ok": True, "result": res}
        else:
            return JSONResponse({"ok": False, "error": f"Unknown tool {name}"}, status_code=400)
    except Exception as e:
        try:
            record_event(tool=name, phase="error", request=args, error=str(e))
        except Exception:
            pass
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    return templates.TemplateResponse("login.html", {"request": request, "google_client_id": google_client_id})


@app.post("/auth/google")
def auth_google(payload: dict):
    credential = payload.get("credential")
    if not credential:
        return JSONResponse({"error": "Missing credential"}, status_code=400)
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        return JSONResponse({"error": "GOOGLE_CLIENT_ID not configured"}, status_code=500)
    try:
        idinfo = google_id_token.verify_oauth2_token(credential, google_requests.Request(), audience=client_id)
        # Upsert user in ES
        user = upsert_user_from_google(idinfo)
        # Issue JWT
        token = issue_jwt({
            "sub": user["id"],
            "email": user.get("email"),
            "name": user.get("name"),
            "picture": user.get("picture"),
        })
        return JSONResponse({"token": token})
    except Exception as e:
        return JSONResponse({"error": "Invalid Google credential"}, status_code=401)


@app.get("/me")
def me(user=Depends(require_user)):
    return user


@app.post("/auth/signup")
def auth_signup(payload: dict):
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    name = payload.get("name")
    if not email or not password:
        return JSONResponse({"error": "Email and password required"}, status_code=400)
    existing = find_user_by_email(email)
    if existing and existing.get("password_hash"):
        return JSONResponse({"error": "User already exists"}, status_code=400)
    user = existing or create_user_email(email, password, name)
    if existing and not existing.get("password_hash"):
        # Convert a Google-only user into one with password by setting hash
        from .auth import hash_password
        existing["password_hash"] = hash_password(password)
        es_client.index(index=os.getenv("ES_USERS_INDEX", "users"), id=existing["id"], document=existing, refresh="wait_for")
        user = existing
    token = issue_jwt({
        "sub": user["id"],
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
    })
    return JSONResponse({"token": token})


@app.post("/auth/login")
def auth_login(payload: dict):
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    if not email or not password:
        return JSONResponse({"error": "Email and password required"}, status_code=400)
    user = find_user_by_email(email)
    if not user or not user.get("password_hash"):
        return JSONResponse({"error": "Invalid credentials"}, status_code=401)
    if not verify_password(password, user["password_hash"]):
        return JSONResponse({"error": "Invalid credentials"}, status_code=401)
    token = issue_jwt({
        "sub": user["id"],
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
    })
    return JSONResponse({"token": token})
