"""
Automated CRM Generator for CRMBLR Platform
Takes AI analysis results and automatically generates a working CRM

PIPELINE:
1. AI processes unstructured data → configuration + data mapping
2. This service generates the actual CRM:
   - Creates database schemas
   - Loads cleaned data
   - Configures modules
   - Sets up workflows
   - Applies branding
3. Client gets login to their fully populated CRM
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import pandas as pd
from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, DateTime, Text, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from elasticsearch import AsyncElasticsearch

from ..core.database import get_client_schema, get_client_es_index, ensure_client_schema, ensure_client_indices
from ..models.ultra_flexible_templates import get_module, get_template
from .ai_data_processor import DataAnalysisResult


@dataclass
class CRMDeploymentResult:
    """Result of CRM deployment"""
    client_id: str
    subdomain: str
    database_url: str
    admin_user: Dict[str, str]
    entities_created: List[str]
    records_imported: Dict[str, int]
    deployment_status: str
    access_url: str


class AutomatedCRMGenerator:
    """Generates complete CRM from AI analysis"""

    def __init__(self, database_url: str, elasticsearch_url: str = None):
        self.db_engine = create_engine(database_url)
        self.es_client = AsyncElasticsearch([elasticsearch_url]) if elasticsearch_url else None

    async def deploy_crm(
        self,
        client_id: str,
        analysis_result: DataAnalysisResult,
        client_details: Dict[str, str]
    ) -> CRMDeploymentResult:
        """
        Main deployment method: create complete CRM from AI analysis
        """

        config = analysis_result.recommended_config

        # Step 1: Create database schema for client
        await self._create_client_database_schema(client_id, config)

        # Step 2: Create Elasticsearch indices
        if self.es_client:
            await self._create_client_elasticsearch_indices(client_id, config)

        # Step 3: Import cleaned data
        import_results = await self._import_client_data(client_id, analysis_result)

        # Step 4: Create admin user
        admin_user = await self._create_admin_user(client_id, client_details)

        # Step 5: Configure branding and settings
        await self._apply_client_configuration(client_id, config, client_details)

        # Step 6: Generate access credentials
        subdomain = self._generate_subdomain(client_details["organization_name"])
        access_url = f"https://{subdomain}.crmblr.com"

        return CRMDeploymentResult(
            client_id=client_id,
            subdomain=subdomain,
            database_url=f"client_schema_{client_id}",
            admin_user=admin_user,
            entities_created=list(config["entities"].keys()),
            records_imported=import_results,
            deployment_status="completed",
            access_url=access_url
        )

    async def _create_client_database_schema(self, client_id: str, config: Dict[str, Any]):
        """Create PostgreSQL schema and tables for client"""

        schema_name = get_client_schema(client_id)

        # Ensure schema exists
        await ensure_client_schema(client_id)

        metadata = MetaData(schema=schema_name)

        # Create tables for each entity in the configuration
        for entity_name, entity_config in config["entities"].items():
            await self._create_entity_table(metadata, entity_name, entity_config)

        # Create the tables
        metadata.create_all(self.db_engine)

    async def _create_entity_table(self, metadata: MetaData, entity_name: str, entity_config: Dict):
        """Create a table for a specific entity"""

        columns = [
            Column('id', UUID(as_uuid=True), primary_key=True),
            Column('created_at', DateTime, nullable=False),
            Column('updated_at', DateTime, nullable=True),
            Column('created_by', String(255), nullable=True),
        ]

        # Add entity-specific fields
        for field in entity_config.get("fields", []):
            column = self._create_column_from_field(field)
            if column:
                columns.append(column)

        # Create the table
        table = Table(entity_name, metadata, *columns)
        return table

    def _create_column_from_field(self, field: Dict) -> Optional[Column]:
        """Create SQLAlchemy column from field definition"""

        field_name = field["name"]
        field_type = field["type"]
        required = field.get("required", False)
        max_length = field.get("max_length")

        # Map field types to SQLAlchemy types
        if field_type == "string":
            column_type = String(max_length or 255)
        elif field_type == "email":
            column_type = String(255)
        elif field_type == "phone":
            column_type = String(50)
        elif field_type == "text":
            column_type = Text
        elif field_type == "integer":
            column_type = Integer
        elif field_type == "decimal":
            column_type = Numeric(12, 2)
        elif field_type == "boolean":
            column_type = Boolean
        elif field_type == "datetime":
            column_type = DateTime
        elif field_type == "date":
            column_type = DateTime  # Store as datetime for simplicity
        elif field_type in ["json", "json_array"]:
            column_type = JSONB
        elif field_type == "choice":
            column_type = String(100)  # Store choice values as strings
        else:
            return None  # Skip unknown field types

        return Column(
            field_name,
            column_type,
            nullable=not required,
            default=field.get("default")
        )

    async def _create_client_elasticsearch_indices(self, client_id: str, config: Dict[str, Any]):
        """Create Elasticsearch indices for client entities"""

        if not self.es_client:
            return

        entity_types = list(config["entities"].keys())
        await ensure_client_indices(client_id, entity_types)

    async def _import_client_data(self, client_id: str, analysis_result: DataAnalysisResult) -> Dict[str, int]:
        """Import cleaned data into client's database"""

        import_results = {}
        schema_name = get_client_schema(client_id)

        for entity_name, entity_data in analysis_result.detected_entities.items():
            try:
                # Get cleaned data
                df = entity_data["cleaned_data"]
                if df.empty:
                    continue

                # Add required fields
                df = self._add_required_fields(df)

                # Import to PostgreSQL
                table_name = f"{schema_name}.{entity_name}"
                records_imported = await self._import_to_postgres(df, table_name)

                # Import to Elasticsearch (optional)
                if self.es_client:
                    await self._import_to_elasticsearch(client_id, entity_name, df)

                import_results[entity_name] = records_imported

            except Exception as e:
                print(f"Error importing {entity_name}: {e}")
                import_results[entity_name] = 0

        return import_results

    def _add_required_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add required fields to DataFrame before import"""
        import uuid
        from datetime import datetime

        # Add system fields
        df = df.copy()
        df['id'] = [str(uuid.uuid4()) for _ in range(len(df))]
        df['created_at'] = datetime.utcnow()
        df['updated_at'] = None
        df['created_by'] = 'data_import'

        return df

    async def _import_to_postgres(self, df: pd.DataFrame, table_name: str) -> int:
        """Import DataFrame to PostgreSQL table"""

        try:
            # Use pandas to_sql for bulk import
            df.to_sql(
                table_name.split('.')[-1],  # table name without schema
                self.db_engine,
                schema=table_name.split('.')[0],  # schema name
                if_exists='append',
                index=False,
                method='multi'
            )
            return len(df)

        except Exception as e:
            print(f"Error importing to PostgreSQL: {e}")
            return 0

    async def _import_to_elasticsearch(self, client_id: str, entity_name: str, df: pd.DataFrame) -> int:
        """Import DataFrame to Elasticsearch"""

        if not self.es_client:
            return 0

        try:
            index_name = get_client_es_index(client_id, entity_name)

            # Prepare documents for bulk import
            docs = []
            for _, row in df.iterrows():
                doc = {
                    "_index": index_name,
                    "_id": row['id'],
                    "_source": row.to_dict()
                }
                docs.append(doc)

            # Bulk import
            from elasticsearch.helpers import async_bulk
            success_count, _ = await async_bulk(self.es_client, docs)
            return success_count

        except Exception as e:
            print(f"Error importing to Elasticsearch: {e}")
            return 0

    async def _create_admin_user(self, client_id: str, client_details: Dict[str, str]) -> Dict[str, str]:
        """Create admin user for the client"""

        import uuid
        import bcrypt
        from datetime import datetime

        # Generate admin credentials
        admin_email = client_details.get("primary_contact_email", f"admin@{client_id}.com")
        admin_password = self._generate_password()
        admin_name = client_details.get("primary_contact_name", "Admin User")

        # Hash password
        password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create user record
        user_data = {
            'id': str(uuid.uuid4()),
            'email': admin_email,
            'full_name': admin_name,
            'hashed_password': password_hash,
            'is_active': True,
            'is_admin': True,
            'created_at': datetime.utcnow(),
        }

        # Insert into client's users table
        schema_name = get_client_schema(client_id)
        # TODO: Insert user into client_users table

        return {
            "email": admin_email,
            "password": admin_password,  # Only returned once for setup
            "name": admin_name
        }

    def _generate_password(self) -> str:
        """Generate secure random password"""
        import secrets
        import string

        # Generate 12-character password
        alphabet = string.ascii_letters + string.digits + "!@#$%&"
        password = ''.join(secrets.choice(alphabet) for _ in range(12))
        return password

    async def _apply_client_configuration(self, client_id: str, config: Dict[str, Any], client_details: Dict[str, str]):
        """Apply client-specific configuration and branding"""

        # Update branding with client details
        config["branding"].update({
            "organization_name": client_details.get("organization_name", "Organization"),
            "primary_color": client_details.get("primary_color", "#4A9B8E"),
            "accent_color": client_details.get("accent_color", "#18A4E0"),
        })

        # Store configuration in database
        # TODO: Store in client configuration table

    def _generate_subdomain(self, organization_name: str) -> str:
        """Generate subdomain from organization name"""
        import re

        # Clean organization name for subdomain
        subdomain = organization_name.lower()
        subdomain = re.sub(r'[^a-z0-9]', '-', subdomain)
        subdomain = re.sub(r'-+', '-', subdomain)
        subdomain = subdomain.strip('-')

        # Limit length
        if len(subdomain) > 20:
            subdomain = subdomain[:20].rstrip('-')

        return subdomain


# ============================================================================
# COMPLETE WORKFLOW EXAMPLE
# ============================================================================

async def complete_crm_deployment_example():
    """Example of complete workflow from data upload to deployed CRM"""

    from .ai_data_processor import AIDataProcessor

    # Step 1: Client uploads messy data
    uploaded_files = [
        {"name": "our_donors.xlsx", "path": "/tmp/donor_export.xlsx"},
        {"name": "volunteer_list.csv", "path": "/tmp/volunteers.csv"},
        {"name": "events_2024.xlsx", "path": "/tmp/events.xlsx"}
    ]

    client_details = {
        "organization_name": "Bay Area Community Center",
        "primary_contact_email": "director@bayareacenter.org",
        "primary_contact_name": "Sarah Johnson",
        "organization_type": "nonprofit"
    }

    # Step 2: AI processes the data
    processor = AIDataProcessor()
    analysis_result = await processor.process_client_data("client456", uploaded_files)

    print(f"✅ AI Analysis Complete:")
    print(f"   Organization Type: {analysis_result.organization_type}")
    print(f"   Suggested Modules: {analysis_result.suggested_modules}")
    print(f"   Entities Found: {list(analysis_result.detected_entities.keys())}")

    # Step 3: Generate CRM automatically
    generator = AutomatedCRMGenerator(
        database_url="postgresql://user:pass@localhost/crmblr_platform",
        elasticsearch_url="http://localhost:9200"
    )

    deployment_result = await generator.deploy_crm("client456", analysis_result, client_details)

    print(f"\n✅ CRM Deployed Successfully:")
    print(f"   Access URL: {deployment_result.access_url}")
    print(f"   Admin Login: {deployment_result.admin_user['email']}")
    print(f"   Admin Password: {deployment_result.admin_user['password']}")
    print(f"   Entities Created: {deployment_result.entities_created}")
    print(f"   Records Imported: {deployment_result.records_imported}")

    return deployment_result


# ============================================================================
# This is the magic:
#
# 1. Client uploads: messy_donors.xlsx, volunteer_hours.csv, event_list.xls
# 2. AI understands: "This is a community nonprofit with donors, volunteers, events"
# 3. System creates: Contacts table, Donations table, Events table, Volunteers (as contacts)
# 4. Data flows in: 500 donors, 50 volunteers, 12 events - all cleaned and structured
# 5. Client gets: login@their-crm.com with their data ready to use
#
# Total time: 30 minutes automated + 1 hour review call = 1 week → 90 minutes
# ============================================================================