import os
from typing import List, Dict, Any, Optional, Iterable, Tuple
import time
from elasticsearch.exceptions import ConnectionError as ESConnectionError
from elasticsearch import Elasticsearch, helpers


def get_es_url() -> str:
    return os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")


def get_index_name() -> str:
    return os.getenv("ES_INDEX", "products")


es_client = Elasticsearch([get_es_url()])


def wait_for_es(max_attempts: int = 60, delay_seconds: float = 1.0) -> bool:
    for _ in range(max_attempts):
        try:
            if es_client.ping():
                return True
        except Exception:
            pass
        time.sleep(delay_seconds)
    return False


def ensure_index() -> None:
    # Ensure ES is reachable first; avoid crashing on startup race
    wait_for_es()
    index = get_index_name()
    try:
        if es_client.indices.exists(index=index):
            return
        es_client.indices.create(
            index=index,
            body={
                "settings": {
                    "analysis": {
                        "analyzer": {
                            "default": {"type": "standard"},
                            "english": {"type": "standard"}
                        }
                    }
                },
                "mappings": {
                    "properties": {
                        "title": {"type": "text", "fields": {"raw": {"type": "keyword"}}},
                        "description": {"type": "text"},
                        "category": {"type": "keyword"},
                        "price": {"type": "float"},
                        "url": {"type": "keyword", "index": False},
                        "image_url": {"type": "keyword", "index": False},
                        "source": {"type": "keyword"},
                        "source_id": {"type": "keyword"},
                        "ingested_at": {"type": "date"}
                    }
                },
            },
        )
    except ESConnectionError:
        # Swallow transient connection errors; app can proceed and queries will retry
        pass


# --- Datasets and bulk ingestion helpers ---

DATASETS_META_INDEX = os.getenv("ES_DATASETS_INDEX", "datasets")
JOBS_INDEX = os.getenv("ES_JOBS_INDEX", "jobs")


def ensure_datasets_indices() -> None:
    try:
        if not es_client.indices.exists(index=DATASETS_META_INDEX):
            es_client.indices.create(
                index=DATASETS_META_INDEX,
                body={
                    "mappings": {
                        "properties": {
                            "user_id": {"type": "keyword"},
                            "name": {"type": "keyword"},
                            "index": {"type": "keyword"},
                            "fields": {"type": "object", "enabled": True},
                            "doc_count": {"type": "long"},
                            "created_at": {"type": "date"},
                        }
                    }
                },
            )
    except Exception:
        pass
    try:
        if not es_client.indices.exists(index=JOBS_INDEX):
            es_client.indices.create(
                index=JOBS_INDEX,
                body={
                    "mappings": {
                        "properties": {
                            "user_id": {"type": "keyword"},
                            "dataset_id": {"type": "keyword"},
                            "status": {"type": "keyword"},
                            "total_rows": {"type": "long"},
                            "indexed_rows": {"type": "long"},
                            "errors": {"type": "integer"},
                            "error_samples": {"type": "keyword"},
                            "created_at": {"type": "date"},
                            "finished_at": {"type": "date"},
                        }
                    }
                },
            )
    except Exception:
        pass


def slugify(name: str) -> str:
    s = "".join(c.lower() if c.isalnum() else "-" for c in (name or "").strip())
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-") or "dataset"


def infer_type(value: str) -> str:
    v = (value or "").strip()
    if v == "" or v.lower() in ("null", "none", "nan"):
        return "null"
    # numeric
    try:
        int(v)
        return "long"
    except Exception:
        pass
    try:
        float(v)
        return "float"
    except Exception:
        pass
    # date detection
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d %H:%M:%S"):
        try:
            import datetime as _dt
            _dt.datetime.strptime(v, fmt)
            return "date"
        except Exception:
            pass
    # default text/keyword decision: short no-spaces -> keyword
    if len(v) <= 64 and (" " not in v):
        return "keyword"
    return "text"


def infer_schema(rows: List[Dict[str, Any]], max_fields: int = 200) -> Dict[str, str]:
    # rows: list of parsed dict rows (sample)
    types: Dict[str, str] = {}
    seen: Dict[str, Dict[str, int]] = {}
    for r in rows:
        for k, v in (r or {}).items():
            if not k or k.startswith("_"):
                continue
            if len(seen) >= max_fields and k not in seen:
                continue
            t = infer_type(str(v))
            bucket = seen.setdefault(k, {})
            bucket[t] = bucket.get(t, 0) + 1
    for k, bucket in seen.items():
        # Conservative typing to minimize ingest errors
        non_null = {t: n for t, n in bucket.items() if t != "null"}
        keys = set(non_null.keys())
        if not non_null:
            types[k] = "text"
            continue
        # Only choose date if all observed non-null values are dates
        if keys == {"date"}:
            types[k] = "date"
            continue
        # Numeric: allow mix of long/float -> float
        if keys.issubset({"long", "float"}):
            types[k] = "float" if ("float" in keys) else "long"
            continue
        # Pure keyword
        if keys == {"keyword"}:
            types[k] = "keyword"
            continue
        # Default: text
        types[k] = "text"
    return types


def build_es_mapping(types: Dict[str, str]) -> Dict[str, Any]:
    props: Dict[str, Any] = {}
    for field, t in (types or {}).items():
        if t == "text":
            props[field] = {"type": "text", "fields": {"raw": {"type": "keyword"}}}
        elif t in ("keyword", "long", "float"):
            props[field] = {"type": t}
        elif t == "date":
            # Accept a few common formats seen in uploads
            props[field] = {
                "type": "date",
                "format": "strict_date_optional_time||epoch_millis||yyyy/MM/dd||MM/dd/yyyy||dd/MM/yyyy||yyyy-MM-dd HH:mm:ss||yyyy/MM/dd HH:mm:ss||dd/MM/yyyy HH:mm:ss",
            }
        else:
            props[field] = {"type": "text"}
    return {"properties": props}


def ensure_user_collection_index(user_id: str, collection: str, mapping: Optional[Dict[str, Any]] = None, recreate: bool = False) -> str:
    idx = f"users-{user_id}-{collection.strip().lower()}"
    exists = es_client.indices.exists(index=idx)
    if exists and recreate:
        try:
            es_client.indices.delete(index=idx, ignore=[404])
            exists = False
        except Exception:
            pass
    if not exists:
        body = {"mappings": mapping or {"properties": {}}}
        try:
            es_client.indices.create(index=idx, body=body)
        except Exception:
            pass
    return idx


def stream_csv_rows(path: str, encoding: Optional[str] = None) -> Iterable[Dict[str, Any]]:
    import csv
    with open(path, "r", encoding=encoding or "utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Normalize: convert empty strings to None
            yield {k: (v if (v is not None and v != "") else None) for k, v in row.items()}


def bulk_index(index: str, docs: Iterable[Tuple[Optional[str], Dict[str, Any]]], chunk_size: int = 500) -> Tuple[int, int]:
    # docs: iterable of (id, doc)
    ok = 0
    errors = 0
    def gen():
        for _id, doc in docs:
            if _id:
                yield {"_op_type": "index", "_index": index, "_id": _id, "_source": doc}
            else:
                yield {"_op_type": "index", "_index": index, "_source": doc}
    try:
        for success, item in helpers.streaming_bulk(es_client, gen(), chunk_size=chunk_size, raise_on_error=False):
            if success:
                ok += 1
            else:
                errors += 1
    except Exception:
        pass
    return ok, errors



def search_products(query: str, size: int = 200) -> List[Dict[str, Any]]:
    index = get_index_name()
    response = es_client.search(
        index=index,
        body={
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": [
                        "title^3",
                        "description",
                        "category^2"
                    ],
                    "type": "best_fields",
                    "operator": "and",
                    "fuzziness": "AUTO"
                }
            },
            "size": size
        },
    )
    hits = [
        {
            "id": h.get("_id"),
            **h.get("_source", {})
        }
        for h in response.get("hits", {}).get("hits", [])
    ]
    return hits


def recent_products(size: int = 200) -> List[Dict[str, Any]]:
    index = get_index_name()
    response = es_client.search(
        index=index,
        body={
            "query": {"match_all": {}},
            "sort": [
                {"ingested_at": {"order": "desc", "missing": "_last"}},
                {"_id": {"order": "desc"}}
            ],
            "size": size,
        },
    )
    hits = [
        {"id": h.get("_id"), **h.get("_source", {})}
        for h in response.get("hits", {}).get("hits", [])
    ]
    return hits


def count_products() -> int:
    index = get_index_name()
    try:
        resp = es_client.count(index=index, body={"query": {"match_all": {}}})
        return int(resp.get("count", 0))
    except Exception:
        return 0
