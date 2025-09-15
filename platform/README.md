# CRMBLR Platform Integration

## Overview
This directory contains the unified platform that merges:
- **CRMBLR**: Voice-driven CRM with Elasticsearch flexibility
- **Make-Lit**: Proven nonprofit CRM framework with PostgreSQL reliability

## Architecture

### Multi-Tenant Design
```
Platform Layer:
├── Customer Management (who)
├── Template System (what)
├── Deployment Engine (how)
└── Billing System ($$)

Client Instances:
├── soma-cbd.crmblr.com (PostgreSQL + Elasticsearch)
├── client2.crmblr.com (template-based)
└── clientN.crmblr.com (rapid deployment)
```

### Technology Stack
- **Backend**: FastAPI (unified from both systems)
- **Database**: PostgreSQL (primary) + Elasticsearch (search/voice)
- **Frontend**: React + TypeScript (Make-Lit foundation)
- **Voice**: OpenAI Realtime API (CRMBLR feature)
- **Deployment**: Docker + subdomain routing

## Directory Structure

```
platform/
├── backend/           # Unified FastAPI backend
│   ├── app/
│   │   ├── api/       # REST API endpoints
│   │   ├── core/      # Configuration, database, auth
│   │   ├── models/    # Multi-tenant data models
│   │   ├── templates/ # Organization templates
│   │   └── services/  # Business logic
├── frontend/          # React platform interface
│   ├── admin/         # Your management dashboard
│   ├── customer/      # Customer onboarding portal
│   └── shared/        # Reusable components
├── templates/         # Organization type templates
│   ├── cbd.json       # Community Benefit District (SOMA West)
│   ├── nonprofit.json # General nonprofit
│   └── foundation.json# Private foundation
└── configs/           # Client configurations
    ├── soma-west.json # SOMA West CBD configuration
    └── template.json  # New client template
```

## Development Phases

### Phase 1: Foundation (Days 1-2)
- [x] Directory structure
- [ ] Multi-tenant database schema
- [ ] Unified authentication
- [ ] Basic platform routing

### Phase 2: Templates (Days 3-4)
- [ ] Extract SOMA West configuration
- [ ] Create template system
- [ ] Dynamic model generation
- [ ] Brand customization

### Phase 3: Customer Flow (Day 5)
- [ ] Intake forms
- [ ] Project management
- [ ] Deployment automation

## Getting Started

```bash
# Set up platform development
cd platform
docker-compose up -d

# Run development servers
npm run dev:admin     # Admin dashboard
npm run dev:customer  # Customer portal
python -m uvicorn backend.app.main:app --reload
```

## Key Features

### For You (Admin)
- Customer project management
- Template configuration
- Deployment automation
- Revenue tracking

### For Customers
- Self-service onboarding
- Progress tracking
- Training materials
- Support portal

### For End Users
- Branded CRM interfaces
- Mobile-optimized (field staff)
- Voice capabilities (premium)
- Real-time dashboards

## Success Metrics

- **Customer Onboarding**: 1 week from payment to launch
- **Template Reuse**: 80% of setup automated
- **Revenue Growth**: $10K+ MRR within 2 months
- **Customer Satisfaction**: 90%+ would recommend

---

**Goal**: Transform the SOMA West success into a repeatable, scalable platform.