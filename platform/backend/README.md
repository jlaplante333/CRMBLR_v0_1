# CRMBLR Platform Backend

AI-powered CRM generation platform for nonprofits. This backend service handles client onboarding, data processing, and CRM deployment.

## Features

- **Multi-tenant Architecture**: Isolated databases per client
- **AI Data Processing**: Automated data analysis and CRM configuration
- **Modular CRM System**: Configurable modules (contacts, donations, events, etc.)
- **Authentication**: JWT-based auth for platform and client users
- **File Processing**: CSV/Excel import with intelligent field mapping
- **Payment Integration**: Stripe payment processing
- **Voice Interface**: OpenAI Realtime API integration

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Elasticsearch 8.x (optional, for search features)
- Redis (optional, for caching)

### Installation

1. **Clone and Setup**
   ```bash
   cd /Users/Laurie/CRMBLR September 14/platform/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb crmblr_platform

   # Run migrations (when implemented)
   alembic upgrade head
   ```

4. **Start Development Server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## Project Structure

```
app/
├── api/
│   └── routes/          # API endpoints
│       ├── auth.py      # Authentication routes
│       ├── platform.py  # Platform management
│       ├── clients.py   # Client CRM operations
│       └── data_processing.py  # File upload & processing
├── core/
│   ├── config.py        # Configuration settings
│   ├── database.py      # Database setup
│   └── auth.py          # Authentication logic
├── models/
│   └── platform.py      # Database models
├── services/
│   ├── basic_data_importer.py     # CSV import (MVP)
│   ├── basic_crm_generator.py     # CRM creation (MVP)
│   ├── ai_data_processor.py       # AI processing (for specialists)
│   └── automated_crm_generator.py # Full automation (for specialists)
└── main.py              # FastAPI application
```

## API Documentation

When running the server, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Endpoints

### Platform Management
- `GET /api/platform/clients` - List all clients
- `GET /api/platform/stats` - Platform statistics
- `POST /api/platform/clients/{id}/activate` - Activate client

### Authentication
- `POST /api/auth/platform/login` - Platform admin login
- `POST /api/auth/client/login` - Client user login
- `POST /api/auth/realtime-token` - Get OpenAI token

### Data Processing
- `POST /api/data/upload` - Upload files for processing
- `POST /api/data/analyze` - Analyze uploaded data
- `POST /api/data/generate-crm` - Generate client CRM
- `POST /api/data/import-csv` - Import CSV to existing CRM

### Client Operations
- `GET /api/clients/dashboard/stats` - Client dashboard data
- `GET /api/clients/contacts` - List contacts
- `POST /api/clients/contacts` - Create contact
- `POST /api/clients/search` - Search CRM data

## Configuration

### Database

The platform uses PostgreSQL with schema-based multi-tenancy:
- Platform data: `public` schema
- Client data: `client_{uuid}` schemas

### Authentication

JWT tokens with different user types:
- `platform`: Platform administrators
- `client`: Client organization users

### File Processing

- Supports CSV and Excel files
- Maximum file size: 50MB
- Auto-detection of field mappings
- Basic data cleaning and validation

## Development

### MVP Implementation

The current implementation is designed for MVP with manual processes:

**What's Built (Vibe Coding):**
- ✅ Platform foundation and auth
- ✅ Client management system
- ✅ Basic file upload and processing
- ✅ Simple CRM generation
- ✅ Customer onboarding flow

**What Needs Specialists:**
- 🔄 AI-powered data analysis (`ai_data_processor.py`)
- 🔄 Complex file parsing (Excel with merged cells, etc.)
- 🔄 Intelligent field mapping
- 🔄 Production error handling and recovery

### Adding AI Features

When ready to add AI capabilities:

1. Implement `services/ai_data_processor.py`
2. Implement `services/automated_crm_generator.py`
3. Update API routes to use AI services
4. Add error handling for AI failures

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## Deployment

### Environment Variables

Key production settings:
- `SECRET_KEY`: Strong secret for JWT signing
- `DATABASE_URL`: Production PostgreSQL connection
- `OPENAI_API_KEY`: For AI features
- `STRIPE_SECRET_KEY`: For payments
- `ALLOWED_ORIGINS`: Frontend domains

### Docker Deployment

```bash
# Build image
docker build -t crmblr-backend .

# Run with environment
docker run -d \
  --name crmblr-backend \
  -p 8000:8000 \
  --env-file .env \
  crmblr-backend
```

### Production Considerations

- Use environment variables for all secrets
- Enable PostgreSQL connection pooling
- Set up proper logging and monitoring
- Configure CORS for your frontend domains
- Use a reverse proxy (nginx) for SSL termination
- Set up automated backups for PostgreSQL

## Architecture Notes

### Multi-Tenant Design

Each client gets their own database schema (`client_{uuid}`) for complete data isolation while sharing the same application instance.

### Modular CRM System

CRMs are built from configurable modules:
- `contacts`: Core contact management
- `donations`: Fundraising and gift tracking
- `events`: Event and program management
- `volunteers`: Volunteer coordination
- `grants`: Grant and funding management
- `services`: Service request tracking

### AI Integration Points

The system is designed for future AI integration:
- File analysis and organization classification
- Intelligent field mapping and data cleaning
- Automated CRM configuration
- Natural language query processing

## Support

For development questions:
- Check the API docs at `/docs`
- Review the MVP Development Plan
- Contact: support@crmblr.com