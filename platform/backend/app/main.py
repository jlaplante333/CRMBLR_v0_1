"""
CRMBLR Platform Main Application
Unified FastAPI app combining platform management with client CRM functionality
"""

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .core.database import check_postgres_health, check_elasticsearch_health
from .core.auth import get_current_user, get_current_platform_user, get_current_client_user

# Import API routes
from .api.routes import auth, platform, clients, data_processing


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""

    # Startup
    print("🚀 Starting CRMBLR Platform...")

    # Check database connections
    postgres_healthy = await check_postgres_health()
    elasticsearch_healthy = await check_elasticsearch_health()

    print(f"📊 PostgreSQL: {'✅ Connected' if postgres_healthy else '❌ Connection failed'}")
    print(f"🔍 Elasticsearch: {'✅ Connected' if elasticsearch_healthy else '❌ Connection failed'}")

    if not postgres_healthy:
        print("⚠️  WARNING: PostgreSQL connection failed - some features may not work")

    print("✅ CRMBLR Platform started successfully")

    yield

    # Shutdown
    print("🛑 Shutting down CRMBLR Platform...")


# Create FastAPI application
app = FastAPI(
    title="CRMBLR Platform",
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

# Mount static files (for serving frontend assets)
# app.mount("/static", StaticFiles(directory="platform/frontend/dist"), name="static")

# Templates for server-side rendering
# templates = Jinja2Templates(directory="platform/frontend/templates")

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(platform.router, prefix="/api/platform", tags=["platform"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(data_processing.router, prefix="/api/data", tags=["data_processing"])


# ============================================================================
# PLATFORM ROUTES (Admin Interface)
# ============================================================================

@app.get("/", response_class=HTMLResponse)
async def platform_dashboard(
    request: Request,
    current_user: dict = Depends(get_current_platform_user)
):
    """Platform administrator dashboard"""
    return templates.TemplateResponse(
        "platform/dashboard.html",
        {"request": request, "user": current_user}
    )


@app.get("/login", response_class=HTMLResponse)
async def platform_login(request: Request):
    """Platform login page"""
    return templates.TemplateResponse(
        "platform/login.html",
        {"request": request}
    )


@app.get("/clients", response_class=HTMLResponse)
async def platform_clients(
    request: Request,
    current_user: dict = Depends(get_current_platform_user)
):
    """Platform client management"""
    return templates.TemplateResponse(
        "platform/clients.html",
        {"request": request, "user": current_user}
    )


@app.get("/clients/{client_id}", response_class=HTMLResponse)
async def platform_client_detail(
    client_id: str,
    request: Request,
    current_user: dict = Depends(get_current_platform_user)
):
    """Platform client detail view"""
    return templates.TemplateResponse(
        "platform/client_detail.html",
        {"request": request, "user": current_user, "client_id": client_id}
    )


# ============================================================================
# CLIENT CRM ROUTES (Dynamic based on subdomain)
# ============================================================================

@app.get("/crm", response_class=HTMLResponse)
async def client_crm_dashboard(
    request: Request,
    current_user: dict = Depends(get_current_client_user)
):
    """Client CRM dashboard (branded per client)"""
    client_id = current_user["client_id"]

    # TODO: Load client configuration and branding
    return templates.TemplateResponse(
        "client/dashboard.html",
        {
            "request": request,
            "user": current_user,
            "client_id": client_id
        }
    )


@app.get("/crm/contacts", response_class=HTMLResponse)
async def client_contacts(
    request: Request,
    current_user: dict = Depends(get_current_client_user)
):
    """Client contacts management"""
    return templates.TemplateResponse(
        "client/contacts.html",
        {"request": request, "user": current_user}
    )


@app.get("/crm/login", response_class=HTMLResponse)
async def client_login(request: Request):
    """Client login page (will be branded per client)"""
    # TODO: Determine client from subdomain
    return templates.TemplateResponse(
        "client/login.html",
        {"request": request}
    )


# ============================================================================
# CUSTOMER ONBOARDING ROUTES
# ============================================================================

@app.get("/onboard", response_class=HTMLResponse)
async def customer_onboarding(request: Request):
    """Customer onboarding flow"""
    return templates.TemplateResponse(
        "onboarding/start.html",
        {"request": request}
    )


@app.get("/onboard/upload", response_class=HTMLResponse)
async def customer_upload(request: Request):
    """Customer file upload page"""
    return templates.TemplateResponse(
        "onboarding/upload.html",
        {"request": request}
    )


@app.get("/onboard/configure", response_class=HTMLResponse)
async def customer_configure(request: Request):
    """Customer configuration page"""
    return templates.TemplateResponse(
        "onboarding/configure.html",
        {"request": request}
    )


@app.get("/onboard/payment", response_class=HTMLResponse)
async def customer_payment(request: Request):
    """Customer payment page"""
    return templates.TemplateResponse(
        "onboarding/payment.html",
        {"request": request}
    )


@app.get("/onboard/progress/{project_id}", response_class=HTMLResponse)
async def customer_progress(project_id: str, request: Request):
    """Customer progress tracking"""
    return templates.TemplateResponse(
        "onboarding/progress.html",
        {"request": request, "project_id": project_id}
    )


# ============================================================================
# HEALTH CHECK AND STATUS
# ============================================================================

@app.get("/health")
async def health_check():
    """System health check"""
    postgres_healthy = await check_postgres_health()
    elasticsearch_healthy = await check_elasticsearch_health()

    return {
        "status": "healthy" if postgres_healthy else "degraded",
        "services": {
            "postgres": "healthy" if postgres_healthy else "unhealthy",
            "elasticsearch": "healthy" if elasticsearch_healthy else "unhealthy"
        },
        "version": "1.0.0"
    }


@app.get("/status")
async def platform_status(
    current_user: dict = Depends(get_current_platform_user)
):
    """Platform status for administrators"""
    # TODO: Add more detailed platform metrics
    return {
        "platform": "CRMBLR",
        "version": "1.0.0",
        "active_clients": 0,  # TODO: Count from database
        "total_users": 0,     # TODO: Count from database
        "uptime": "unknown"   # TODO: Calculate uptime
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Custom 404 page"""
    return templates.TemplateResponse(
        "errors/404.html",
        {"request": request},
        status_code=404
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    """Custom 500 page"""
    return templates.TemplateResponse(
        "errors/500.html",
        {"request": request},
        status_code=500
    )


# ============================================================================
# SUBDOMAIN ROUTING (for client CRMs)
# ============================================================================

@app.middleware("http")
async def subdomain_routing_middleware(request: Request, call_next):
    """
    Route requests based on subdomain to appropriate client CRM

    Examples:
    - platform.crmblr.com → Platform admin interface
    - soma-west.crmblr.com → SOMA West CBD CRM
    - arts-org.crmblr.com → Arts Nonprofit CRM
    """

    host = request.headers.get("host", "")

    # Extract subdomain
    parts = host.split(".")
    if len(parts) >= 3:  # subdomain.crmblr.com
        subdomain = parts[0]

        # Platform subdomains
        if subdomain in ["platform", "admin", "www"]:
            # Route to platform interface
            pass

        # Client subdomains
        else:
            # TODO: Look up client by subdomain
            # TODO: Set client context for request
            # For now, we'll handle this in individual route handlers
            pass

    response = await call_next(request)
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )