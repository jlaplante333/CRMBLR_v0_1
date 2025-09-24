# 🚀 CRMblr - Multi-tenant AI-generated CRM Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

A production-ready, multi-tenant CRM platform that automatically generates full CRM systems from uploaded data (IRS 990s, CSV/Excel files, database extracts). Built with modern technologies and designed for scalability, security, and ease of use.

## ✨ Key Features

- 🤖 **AI-Powered CRM Generation** - Upload data files and automatically generate complete CRM systems
- 🏢 **Multi-tenant Architecture** - Complete tenant isolation with Row Level Security (RLS)
- 🎨 **Custom Branding** - Each tenant gets their own colors, logos, and subdomain
- 📊 **Natural Language Reports** - Ask questions in plain English, get SQL-powered insights
- 🔧 **Custom Fields** - Dynamic field definitions for any module
- 📁 **Data Import/Export** - CSV/Excel uploads with intelligent column mapping
- 👥 **Role-based Access** - Owner, Admin, Editor, Viewer permissions
- 🔒 **Enterprise Security** - JWT auth, RLS policies, SQL guardrails, audit logging

## 🎭 Live Demo

Experience CRMblr with 4 pre-configured demo tenants:

| Organization | URL | Demo Credentials |
|-------------|-----|------------------|
| **MAKE Literary Productions** | [makelit.crmblr.com](https://makelit.crmblr.com) | `owner@makelit.org` / `Demo!Make` |
| **1in6** | [oneinsix.crmblr.com](https://oneinsix.crmblr.com) | `owner@oneinsix.org` / `Demo!One6` |
| **Fallen Fruit** | [fallenfruit.crmblr.com](https://fallenfruit.crmblr.com) | `owner@fallenfruit.org` / `Demo!Fruit` |
| **Homeboy Industries** | [homeboy.crmblr.com](https://homeboy.crmblr.com) | `owner@homeboy.org` / `Demo!Homeboy` |

Each tenant includes realistic data across all modules: 150+ contacts, 400+ donations, 45+ grants, organizations, staff, and custom fields.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Docker** and **Docker Compose**
- **PostgreSQL** 15+ (or use Docker)
- **Redis** (or use Docker)

### Local Development

**Quick Setup (Recommended):**
```bash
git clone https://github.com/jlaplante333/CRMBLR_v0_1.git
cd CRMBLR_v0_1
./setup.sh
```

**Manual Setup:**
1. **Clone and install:**
   ```bash
   git clone https://github.com/jlaplante333/CRMBLR_v0_1.git
   cd CRMBLR_v0_1
   pnpm install
   ```

2. **Environment setup:**
   ```bash
   cp env.local.example .env.local
   # Edit .env.local with your settings
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Database setup:**
   ```bash
   # Run database migrations
   pnpm db:migrate
   
   # Seed with demo data (creates 4 demo tenants with realistic data)
   pnpm seed:demo
   ```
   
   **What gets seeded:**
   - 🏢 **4 Demo Tenants**: MAKE Literary, 1in6, Fallen Fruit, Homeboy Industries
   - 👥 **150+ Contacts** per tenant with realistic names, stages, and scores
   - 💰 **400+ Donations** with proper campaigns and thank-you statuses
   - 📋 **45+ Grant Applications** with deadlines and statuses
   - 🏢 **5+ Organizations** (foundations, venues, partners)
   - 👨‍💼 **5 Staff Members** per tenant with roles and departments
   - 📊 **Custom Fields** for donations, contacts, and grants
   - 🎯 **Pipeline Events** for contact cultivation tracking

5. **Access demo tenants:**
   ```bash
   # Demo login credentials (after seeding)
   # MAKE Literary Productions (makelit):
   #   Owner: owner@makelit.org / Demo!Make
   #   Admin: admin@makelit.org / Demo!Make
   #   Editor: editor@makelit.org / Demo!Make
   #   Viewer: viewer@makelit.org / Demo!Make
   
   # 1in6 (oneinsix):
   #   Owner: owner@oneinsix.org / Demo!One6
   #   Admin: admin@oneinsix.org / Demo!One6
   #   Editor: editor@oneinsix.org / Demo!One6
   #   Viewer: viewer@oneinsix.org / Demo!One6
   
   # Fallen Fruit (fallenfruit):
   #   Owner: owner@fallenfruit.org / Demo!Fruit
   #   Admin: admin@fallenfruit.org / Demo!Fruit
   #   Editor: editor@fallenfruit.org / Demo!Fruit
   #   Viewer: viewer@fallenfruit.org / Demo!Fruit
   
   # Homeboy Industries (homeboy):
   #   Owner: owner@homeboy.org / Demo!Homeboy
   #   Admin: admin@homeboy.org / Demo!Homeboy
   #   Editor: editor@homeboy.org / Demo!Homeboy
   #   Viewer: viewer@homeboy.org / Demo!Homeboy
   ```

6. **Start development:**
   ```bash
   pnpm dev
   ```

**Services running:**
- 🌐 Web App: http://localhost:3000
- 🔌 API Server: http://localhost:3001
- ⚙️ Worker: Background processing
- 🗄️ Database: localhost:5432
- 📦 Redis: localhost:6379

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind, shadcn/ui | Modern React app with App Router |
| **Backend** | NestJS, class-validator, Swagger | RESTful API with validation |
| **Database** | PostgreSQL, Prisma, RLS | Multi-tenant data with security |
| **Worker** | Node.js, BullMQ, SQS | Background ETL processing |
| **Storage** | AWS S3 | File uploads and assets |
| **Auth** | Amazon Cognito | User management and SSO |
| **AI** | Amazon Bedrock (Claude 3.x) | Natural language to SQL |
| **Infrastructure** | Terraform, AWS ECS | Scalable cloud deployment |
| **CI/CD** | GitHub Actions | Automated testing and deployment |

### Project Structure

```
CRMBLR_v0_1/
├── 📁 apps/
│   ├── 🌐 web/          # Next.js web application
│   ├── 🔌 api/          # NestJS API server
│   ├── ⚙️ worker/       # Background job processor
│   └── 🏗️ infra/        # Terraform infrastructure
├── 📦 packages/
│   ├── 🎨 ui/           # Shared UI components (shadcn/ui)
│   ├── 🗄️ db/           # Prisma schema & client
│   ├── 🔐 auth/         # Authentication utilities
│   ├── 🤖 llm/          # LLM integration (Bedrock/OpenAI)
│   └── 📝 types/        # Shared TypeScript types
├── 📁 uploads/          # Local file uploads (dev only)
├── 🐳 docker-compose.yml
├── 📋 package.json
└── 📖 README.md
```

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm format           # Format code
pnpm typecheck        # Type checking

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed base data
pnpm seed:demo        # Create demo tenants + data
pnpm seed:clear       # Clear demo data

# Testing
pnpm test:unit        # Unit tests
pnpm test:e2e         # E2E tests (Playwright)
pnpm test:sql         # SQL validator tests
```

## 🛡️ Security Features

### Multi-tenant Isolation
- **Row Level Security (RLS)** - 100% tenant data isolation
- **Tenant Context** - Automatic tenant ID injection
- **Subdomain Routing** - tenant.crmblr.com isolation

### SQL Security
- **Read-only Queries** - Only SELECT statements allowed
- **Row Limits** - Maximum 1000 rows per query
- **Timeout Protection** - 30-second query timeout
- **Keyword Blocking** - Prevents dangerous SQL operations

### Authentication & Authorization
- **JWT Tokens** - Secure session management
- **Role-based Access** - Owner/Admin/Editor/Viewer permissions
- **Cognito Integration** - Enterprise SSO support
- **Audit Logging** - All mutations tracked

### Infrastructure Security
- **VPC Isolation** - Private subnets for database
- **WAF Protection** - CloudFront with AWS WAF
- **Encrypted Storage** - S3 with encryption at rest
- **Least Privilege IAM** - Minimal required permissions

## 📊 Core Modules

### 💰 Donations Management
- Track contributions and campaigns
- Thank-you status management
- Campaign progress tracking
- Donor lifetime value analysis

### 🎯 Pipeline Management
- Contact stage progression
- Event tracking and notes
- Cultivation timeline
- Prospect scoring

### 📋 Grants Management
- Application tracking
- Deadline monitoring
- Status management
- Organization relationships

### 🏢 Organizations
- Partner management
- Funder tracking
- Venue coordination
- Relationship mapping

### 👥 Staff Directory
- Team member management
- Role assignments
- Department organization
- Contact information

### 📈 Reports & Analytics
- Natural language queries
- Custom report builder
- CSV export functionality
- Saved report templates

## 🎨 Custom Fields Engine

### Field Types
- **Text** - Single-line text input
- **Number** - Numeric values with validation
- **Date** - Date picker with formatting
- **Boolean** - True/false toggles
- **Select** - Dropdown with predefined options
- **Multi-select** - Multiple choice selections

### Dynamic Rendering
- **Column Picker** - Show/hide fields in tables
- **Form Generation** - Automatic CRUD forms
- **Validation** - Type-specific validation rules
- **Search** - Full-text search across custom fields

## 📁 Data Import/Export

### Supported Formats
- **CSV** - Comma-separated values
- **Excel** - .xlsx and .xls files
- **PDF** - IRS 990 forms (future)
- **XML** - Database exports (future)

### Import Process
1. **File Upload** - Drag & drop or browse
2. **Column Mapping** - Map source to target fields
3. **Data Preview** - Review before import
4. **ETL Processing** - Background job processing
5. **Progress Tracking** - Real-time status updates

### Export Features
- **CSV Export** - Any report or table view
- **Custom Formats** - Configurable output
- **Scheduled Exports** - Automated reports
- **Data Backup** - Full tenant data export

## 🚀 Deployment

### AWS Infrastructure

```bash
# Deploy infrastructure
cd apps/infra
terraform init
terraform plan
terraform apply
```

### Environment Configuration

Required environment variables (see `env.example`):

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL="redis://host:6379"

# AWS Services
AWS_REGION="us-east-1"
COGNITO_USER_POOL_ID="us-east-1_xxxxx"
S3_BUCKET="crmblr-prod-uploads"

# AI Services
BEDROCK_MODEL_ID="anthropic.claude-3-sonnet-20240229-v1:0"
OPENAI_API_KEY="sk-xxxxx"  # Optional fallback

# Security
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### CI/CD Pipeline

GitHub Actions automatically:
- ✅ Lint and type-check code
- 🧪 Run comprehensive test suite
- 🐳 Build Docker images
- 🚀 Deploy to AWS ECS
- 🗄️ Run database migrations
- 📊 Generate deployment reports

## 🧪 Testing

### Test Coverage
- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user journey testing
- **SQL Validator Tests** - Security validation testing

### Running Tests
```bash
# All tests
pnpm test

# Specific test suites
pnpm test:unit        # Unit tests
pnpm test:integration # API tests
pnpm test:e2e         # Playwright E2E
pnpm test:sql         # SQL validator tests

# Coverage report
pnpm test:coverage
```

### Test Scenarios
- ✅ Multi-tenant data isolation
- ✅ Authentication and authorization
- ✅ SQL injection prevention
- ✅ File upload security
- ✅ Custom field validation
- ✅ Report generation accuracy

## 📚 API Documentation

### Authentication
All API endpoints require JWT authentication:
```bash
Authorization: Bearer <jwt-token>
x-tenant-id: <tenant-uuid>
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tenants` | Create new workspace |
| `POST` | `/tenants/:id/uploads` | Get presigned S3 upload URL |
| `POST` | `/tenants/:id/import` | Start ETL import job |
| `GET` | `/tenants/:id/progress/:jobId` | Check job status |
| `POST` | `/reports/generate` | Generate SQL from natural language |
| `POST` | `/reports/run` | Execute SQL query |
| `GET` | `/custom-fields` | Get field definitions |
| `POST` | `/custom-fields` | Create field definition |

### Example API Usage

```typescript
// Generate report from natural language
const response = await fetch('/api/reports/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'x-tenant-id': '<tenant-id>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Show me all donors who gave more than $1000 in the last year",
    module: "donations"
  })
});

const { sql, explanation } = await response.json();
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### Getting Help
- 📖 **Documentation** - Check this README and inline docs
- 🐛 **Issues** - Report bugs via GitHub Issues
- 💬 **Discussions** - Join community discussions
- 📧 **Email** - Contact support@crmblr.com

### Community Resources
- 🎥 **Video Tutorials** - Coming soon
- 📚 **API Documentation** - Available at `/api/docs`
- 🏗️ **Architecture Guide** - Detailed technical docs
- 🔧 **Deployment Guide** - Step-by-step deployment

## 🌟 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Prisma** - Excellent database toolkit
- **Next.js** - Amazing React framework
- **NestJS** - Powerful Node.js framework
- **AWS** - Reliable cloud infrastructure
- **Anthropic** - Advanced AI capabilities

---

<div align="center">

**Built with ❤️ for the nonprofit community**

[Website](https://crmblr.com) • [Documentation](https://docs.crmblr.com) • [Support](mailto:support@crmblr.com)

</div>