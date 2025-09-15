"""
Basic CRM Generation Service (MVP Version)
Creates client CRM schemas and basic configuration
For AI-powered generation, see automated_crm_generator.py
"""

import uuid
from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
import asyncio
import logging

from ..core.database import get_client_schema
from ..models.platform import Client, ClientUser, ClientProject
from ..core.auth import hash_password


logger = logging.getLogger(__name__)


class BasicCRMGenerator:
    """Simple CRM generator for MVP - creates basic schema and configuration"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_client_crm(
        self,
        client_data: Dict[str, Any],
        selected_modules: List[str]
    ) -> Dict[str, Any]:
        """
        Create a new client CRM with basic configuration

        Args:
            client_data: Client information (name, subdomain, contact info, etc.)
            selected_modules: List of CRM modules to enable

        Returns:
            Generation result with client ID and status
        """
        try:
            # Create client record
            client = await self._create_client_record(client_data)

            # Create client database schema
            schema_name = get_client_schema(str(client.id))
            await self._create_client_schema(schema_name, selected_modules)

            # Create admin user
            admin_user = await self._create_admin_user(client.id, client_data)

            # Create project record for tracking
            project = await self._create_project_record(
                client.id, selected_modules, client_data
            )

            return {
                "success": True,
                "client_id": str(client.id),
                "project_id": str(project.id),
                "schema_name": schema_name,
                "crm_url": f"https://{client.subdomain}.crmblr.com",
                "admin_email": admin_user.email,
                "modules_created": selected_modules
            }

        except Exception as e:
            logger.error(f"Error creating CRM: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }

    async def _create_client_record(self, client_data: Dict[str, Any]) -> Client:
        """Create client record in platform database"""

        client = Client(
            id=uuid.uuid4(),
            name=client_data.get('name', 'Unnamed Organization'),
            subdomain=client_data.get('subdomain', f"client-{uuid.uuid4().hex[:8]}"),
            organization_type=client_data.get('organization_type', 'nonprofit'),
            plan=client_data.get('plan', 'medium'),
            status='active',
            primary_contact_email=client_data.get('contact_email'),
            primary_contact_name=client_data.get('contact_name'),
            configuration={
                'modules': client_data.get('selected_modules', ['contacts']),
                'branding': {
                    'primary_color': client_data.get('primary_color', '#4F46E5')
                }
            },
            setup_fee_paid=True  # Assume payment completed at this point
        )

        self.db.add(client)
        await self.db.commit()
        await self.db.refresh(client)

        return client

    async def _create_client_schema(self, schema_name: str, modules: List[str]):
        """Create database schema and tables for client"""

        # Create schema
        await self.db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))

        # Create core tables for each module
        for module in modules:
            await self._create_module_tables(schema_name, module)

        await self.db.commit()

    async def _create_module_tables(self, schema_name: str, module: str):
        """Create tables for a specific module"""

        table_definitions = {
            'contacts': f'''
                CREATE TABLE IF NOT EXISTS {schema_name}.contacts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    email VARCHAR(255),
                    phone VARCHAR(50),
                    organization VARCHAR(255),
                    title VARCHAR(100),
                    address TEXT,
                    city VARCHAR(100),
                    state VARCHAR(50),
                    zip VARCHAR(20),
                    country VARCHAR(100) DEFAULT 'USA',
                    notes TEXT,
                    tags TEXT[],
                    status VARCHAR(50) DEFAULT 'active',
                    source VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_contacts_email ON {schema_name}.contacts(email);
                CREATE INDEX IF NOT EXISTS idx_contacts_name ON {schema_name}.contacts(last_name, first_name);
                CREATE INDEX IF NOT EXISTS idx_contacts_organization ON {schema_name}.contacts(organization);
            ''',

            'donations': f'''
                CREATE TABLE IF NOT EXISTS {schema_name}.donations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    contact_id UUID REFERENCES {schema_name}.contacts(id),
                    donor_name VARCHAR(255),
                    donor_email VARCHAR(255),
                    amount DECIMAL(10,2) NOT NULL,
                    donation_date DATE NOT NULL,
                    campaign VARCHAR(255),
                    fund VARCHAR(255),
                    method VARCHAR(100),
                    reference_number VARCHAR(100),
                    notes TEXT,
                    status VARCHAR(50) DEFAULT 'completed',
                    tax_deductible BOOLEAN DEFAULT true,
                    acknowledged BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_donations_contact ON {schema_name}.donations(contact_id);
                CREATE INDEX IF NOT EXISTS idx_donations_date ON {schema_name}.donations(donation_date);
                CREATE INDEX IF NOT EXISTS idx_donations_campaign ON {schema_name}.donations(campaign);
            ''',

            'events': f'''
                CREATE TABLE IF NOT EXISTS {schema_name}.events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    event_date DATE,
                    start_time TIME,
                    end_time TIME,
                    location VARCHAR(255),
                    address TEXT,
                    capacity INTEGER,
                    registered_count INTEGER DEFAULT 0,
                    price DECIMAL(8,2) DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'planned',
                    category VARCHAR(100),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS {schema_name}.event_registrations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    event_id UUID REFERENCES {schema_name}.events(id),
                    contact_id UUID REFERENCES {schema_name}.contacts(id),
                    registration_date TIMESTAMP DEFAULT NOW(),
                    status VARCHAR(50) DEFAULT 'registered',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_events_date ON {schema_name}.events(event_date);
                CREATE INDEX IF NOT EXISTS idx_registrations_event ON {schema_name}.event_registrations(event_id);
            ''',

            'volunteers': f'''
                CREATE TABLE IF NOT EXISTS {schema_name}.volunteers (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    contact_id UUID REFERENCES {schema_name}.contacts(id),
                    volunteer_name VARCHAR(255),
                    email VARCHAR(255),
                    phone VARCHAR(50),
                    skills TEXT[],
                    availability TEXT,
                    hours_logged DECIMAL(8,2) DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'active',
                    background_check BOOLEAN DEFAULT false,
                    emergency_contact VARCHAR(255),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS {schema_name}.volunteer_hours (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    volunteer_id UUID REFERENCES {schema_name}.volunteers(id),
                    activity VARCHAR(255),
                    hours DECIMAL(4,2) NOT NULL,
                    date DATE NOT NULL,
                    notes TEXT,
                    approved BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_volunteers_contact ON {schema_name}.volunteers(contact_id);
                CREATE INDEX IF NOT EXISTS idx_volunteer_hours_volunteer ON {schema_name}.volunteer_hours(volunteer_id);
            ''',

            'grants': f'''
                CREATE TABLE IF NOT EXISTS {schema_name}.grants (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    funder VARCHAR(255),
                    amount DECIMAL(12,2),
                    purpose TEXT,
                    application_date DATE,
                    decision_date DATE,
                    start_date DATE,
                    end_date DATE,
                    status VARCHAR(50) DEFAULT 'researching',
                    probability INTEGER DEFAULT 0,
                    notes TEXT,
                    documents TEXT[],
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_grants_status ON {schema_name}.grants(status);
                CREATE INDEX IF NOT EXISTS idx_grants_decision_date ON {schema_name}.grants(decision_date);
            ''',

            'services': f'''
                CREATE TABLE IF NOT EXISTS {schema_name}.service_requests (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    contact_id UUID REFERENCES {schema_name}.contacts(id),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    priority VARCHAR(50) DEFAULT 'medium',
                    status VARCHAR(50) DEFAULT 'open',
                    assigned_to VARCHAR(255),
                    requested_date DATE DEFAULT CURRENT_DATE,
                    completed_date DATE,
                    location VARCHAR(255),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_service_requests_contact ON {schema_name}.service_requests(contact_id);
                CREATE INDEX IF NOT EXISTS idx_service_requests_status ON {schema_name}.service_requests(status);
            '''
        }

        if module in table_definitions:
            await self.db.execute(text(table_definitions[module]))
        else:
            logger.warning(f"No table definition found for module: {module}")

    async def _create_admin_user(self, client_id: uuid.UUID, client_data: Dict[str, Any]) -> ClientUser:
        """Create the first admin user for the client"""

        admin_email = client_data.get('admin_email') or client_data.get('contact_email')
        admin_name = client_data.get('contact_name', 'Admin User')
        temp_password = client_data.get('temp_password', 'TempPass123!')

        # Split name if provided
        name_parts = admin_name.split(' ', 1)
        first_name = name_parts[0] if name_parts else 'Admin'
        last_name = name_parts[1] if len(name_parts) > 1 else 'User'

        admin_user = ClientUser(
            id=uuid.uuid4(),
            client_id=client_id,
            email=admin_email,
            hashed_password=hash_password(temp_password),
            full_name=admin_name,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_admin=True
        )

        self.db.add(admin_user)
        await self.db.commit()
        await self.db.refresh(admin_user)

        return admin_user

    async def _create_project_record(
        self,
        client_id: uuid.UUID,
        modules: List[str],
        client_data: Dict[str, Any]
    ) -> ClientProject:
        """Create project record for tracking CRM generation"""

        project = ClientProject(
            id=uuid.uuid4(),
            client_id=client_id,
            name=f"CRM Setup for {client_data.get('name', 'Client')}",
            description=f"Initial CRM setup with modules: {', '.join(modules)}",
            status='completed',  # For basic generator, mark as completed immediately
            progress_percentage=100
        )

        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)

        return project

    async def get_client_modules(self, client_id: str) -> List[str]:
        """Get enabled modules for a client"""

        try:
            result = await self.db.execute(
                select(Client.configuration).where(Client.id == client_id)
            )
            client_config = result.scalar_one_or_none()

            if client_config and 'modules' in client_config:
                return client_config['modules']

            return ['contacts']  # Default module

        except Exception as e:
            logger.error(f"Error getting client modules: {str(e)}")
            return ['contacts']

    async def update_client_configuration(
        self,
        client_id: str,
        config_updates: Dict[str, Any]
    ) -> bool:
        """Update client configuration"""

        try:
            # Get current config
            result = await self.db.execute(
                select(Client).where(Client.id == client_id)
            )
            client = result.scalar_one_or_none()

            if not client:
                return False

            # Update configuration
            current_config = client.configuration or {}
            current_config.update(config_updates)

            # Save changes
            update_query = text(
                "UPDATE clients SET configuration = :config, updated_at = NOW() WHERE id = :client_id"
            )
            await self.db.execute(update_query, {
                "config": current_config,
                "client_id": client_id
            })
            await self.db.commit()

            return True

        except Exception as e:
            logger.error(f"Error updating client configuration: {str(e)}")
            await self.db.rollback()
            return False


# Helper function for API routes
async def generate_basic_crm(
    db: AsyncSession,
    client_data: Dict[str, Any],
    selected_modules: List[str]
) -> Dict[str, Any]:
    """Convenience function for generating basic CRM"""

    generator = BasicCRMGenerator(db)
    return await generator.create_client_crm(client_data, selected_modules)