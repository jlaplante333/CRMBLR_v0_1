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
