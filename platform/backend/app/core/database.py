"""
Multi-tenant database configuration
Supports both PostgreSQL (primary) and Elasticsearch (search/voice)
"""

import os
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
# from elasticsearch import AsyncElasticsearch  # Optional dependency
from .config import settings

# PostgreSQL Setup
engine = create_async_engine(
    settings.async_database_url,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

# Elasticsearch Setup (optional)
es_client = None

def get_elasticsearch():
    """Get Elasticsearch client (disabled for MVP)"""
    return None

async def get_database() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Database dependency for FastAPI
DatabaseDep = get_database

# Multi-tenant utilities
def get_client_schema(client_id: str) -> str:
    """Get PostgreSQL schema name for client"""
    return f"client_{client_id}"

def get_client_es_index(client_id: str, entity_type: str) -> str:
    """Get Elasticsearch index name for client entity"""
    return f"{settings.ES_INDEX_PREFIX}_{client_id}_{entity_type}"

async def ensure_client_schema(client_id: str) -> None:
    """Ensure client-specific PostgreSQL schema exists"""
    schema_name = get_client_schema(client_id)
    async with AsyncSessionLocal() as session:
        await session.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name}")
        await session.commit()

async def ensure_client_indices(client_id: str, entity_types: list[str]) -> None:
    """Ensure client-specific Elasticsearch indices exist"""
    es = get_elasticsearch()
    if not es:
        return

    for entity_type in entity_types:
        index_name = get_client_es_index(client_id, entity_type)
        if not await es.indices.exists(index=index_name):
            await es.indices.create(
                index=index_name,
                body={
                    "mappings": {
                        "properties": {
                            "id": {"type": "keyword"},
                            "type": {"type": "keyword"},
                            "created_at": {"type": "date"},
                            "updated_at": {"type": "date"},
                            # Dynamic mapping for flexible schema
                            # Specific mappings added based on entity type
                        }
                    }
                }
            )

# Health checks
async def check_postgres_health() -> bool:
    """Check PostgreSQL connection health"""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
            return True
    except Exception:
        return False

async def check_elasticsearch_health() -> bool:
    """Check Elasticsearch connection health (disabled for MVP)"""
    return False