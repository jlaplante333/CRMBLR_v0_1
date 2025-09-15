"""
CRMBLR Platform Main Application - Simplified for Testing
API-only version without templates
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .core.database import check_postgres_health, check_elasticsearch_health

# Import API routes
from .api.routes import auth, platform, clients, data_processing, enhanced_onboarding


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""

    # Startup
    print("🚀 Starting CRMBLR Platform (API Only)...")

    # Check database connections
    postgres_healthy = await check_postgres_health()
    elasticsearch_healthy = await check_elasticsearch_health()

    print(f"📊 Database: {'✅ Connected' if postgres_healthy else '❌ Connection failed'}")
    print(f"🔍 Elasticsearch: {'✅ Connected' if elasticsearch_healthy else '❌ Disabled for MVP'}")

    if not postgres_healthy:
        print("⚠️  WARNING: Database connection failed - using SQLite fallback")

    print("✅ CRMBLR Platform API started successfully")

    yield

    # Shutdown
    print("🛑 Shutting down CRMBLR Platform...")


# Create FastAPI application
app = FastAPI(
    title="CRMBLR Platform API",
    description="AI-powered CRM generation platform for nonprofits",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(platform.router, prefix="/api/platform", tags=["platform"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(data_processing.router, prefix="/api/data", tags=["data_processing"])
app.include_router(enhanced_onboarding.router, prefix="/api/enhanced", tags=["enhanced_onboarding"])


# Basic health check
@app.get("/health")
async def health_check():
    """System health check"""
    postgres_healthy = await check_postgres_health()
    elasticsearch_healthy = await check_elasticsearch_health()

    return {
        "status": "healthy" if postgres_healthy else "degraded",
        "services": {
            "database": "healthy" if postgres_healthy else "unhealthy",
            "elasticsearch": "healthy" if elasticsearch_healthy else "disabled"
        },
        "version": "1.0.0"
    }


# Basic welcome message
@app.get("/")
async def welcome():
    """Welcome message"""
    return {
        "message": "CRMBLR Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )