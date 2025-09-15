"""
CRMBLR Platform Configuration
Unified configuration system for multi-tenant CRM platform
"""

import os
from typing import Dict, List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """Platform configuration settings"""

    # App Info
    APP_NAME: str = "CRMBLR Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database Configuration
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")

    # Database - PostgreSQL (primary)
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "changethis")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "crmblr_platform")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    # Database - Elasticsearch (search/voice)
    ELASTICSEARCH_URL: str = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    ES_INDEX_PREFIX: str = os.getenv("ES_INDEX_PREFIX", "crmblr")

    # OpenAI (voice features)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")

    # Stripe (billing)
    STRIPE_PUBLISHABLE_KEY: Optional[str] = os.getenv("STRIPE_PUBLISHABLE_KEY")
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")

    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Platform
    PLATFORM_DOMAIN: str = os.getenv("PLATFORM_DOMAIN", "crmblr.com")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@crmblr.com")

    # Multi-tenant
    MAX_CLIENTS_PER_INSTANCE: int = 100
    DEFAULT_USER_LIMIT: int = 5

    @validator("POSTGRES_SERVER", pre=True)
    def validate_postgres_server(cls, v: str) -> str:
        return v

    @property
    def database_url(self) -> str:
        """PostgreSQL connection URL"""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def async_database_url(self) -> str:
        """Async database connection URL"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "allow"
    }


# Global settings instance
settings = Settings()