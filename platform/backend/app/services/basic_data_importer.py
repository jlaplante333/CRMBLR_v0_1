"""
Basic Data Import Service (MVP Version)
Simple CSV import functionality for clean, well-formatted files
For complex AI-powered import, see ai_data_processor.py
"""

import pandas as pd
import os
import uuid
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import asyncio
import logging

from ..core.database import get_client_schema


logger = logging.getLogger(__name__)


class BasicDataImporter:
    """Simple data importer for MVP - handles clean CSV files only"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def import_csv_file(
        self,
        client_id: str,
        file_path: str,
        table_name: str,
        field_mappings: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Import a clean CSV file to client CRM

        Args:
            client_id: Client UUID
            file_path: Path to CSV file
            table_name: Target table (contacts, donations, events, etc.)
            field_mappings: Map of CSV columns to database fields

        Returns:
            Import result with success/failure details
        """
        try:
            # Validate file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            # Read CSV file
            df = pd.read_csv(file_path)

            if len(df) == 0:
                return {
                    "success": False,
                    "error": "CSV file is empty",
                    "records_processed": 0
                }

            # Clean and map the data
            mapped_data = self._map_csv_data(df, field_mappings)

            # Get client schema
            schema_name = get_client_schema(client_id)

            # Ensure target table exists
            await self._ensure_table_exists(schema_name, table_name)

            # Import data
            records_imported = await self._import_records(
                schema_name, table_name, mapped_data
            )

            return {
                "success": True,
                "records_processed": len(df),
                "records_imported": records_imported,
                "table_name": table_name,
                "schema_name": schema_name
            }

        except Exception as e:
            logger.error(f"Error importing CSV for client {client_id}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "records_processed": 0,
                "records_imported": 0
            }

    def _map_csv_data(self, df: pd.DataFrame, field_mappings: Dict[str, str]) -> List[Dict[str, Any]]:
        """Map CSV columns to database fields"""

        mapped_records = []

        for _, row in df.iterrows():
            mapped_record = {}

            # Add ID field
            mapped_record['id'] = str(uuid.uuid4())

            # Map fields according to mapping
            for csv_column, db_field in field_mappings.items():
                if csv_column in df.columns:
                    value = row[csv_column]

                    # Basic data cleaning
                    if pd.isna(value):
                        mapped_record[db_field] = None
                    elif isinstance(value, str):
                        mapped_record[db_field] = value.strip()
                    else:
                        mapped_record[db_field] = value

            # Add timestamps
            mapped_record['created_at'] = 'NOW()'
            mapped_record['updated_at'] = 'NOW()'

            mapped_records.append(mapped_record)

        return mapped_records

    async def _ensure_table_exists(self, schema_name: str, table_name: str):
        """Ensure the target table exists with basic structure"""

        table_schemas = {
            'contacts': '''
                CREATE TABLE IF NOT EXISTS {schema}.{table} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    email VARCHAR(255),
                    phone VARCHAR(50),
                    organization VARCHAR(255),
                    address TEXT,
                    city VARCHAR(100),
                    state VARCHAR(50),
                    zip VARCHAR(20),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            ''',
            'donations': '''
                CREATE TABLE IF NOT EXISTS {schema}.{table} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    contact_id UUID,
                    donor_name VARCHAR(255),
                    amount DECIMAL(10,2),
                    donation_date DATE,
                    campaign VARCHAR(255),
                    method VARCHAR(100),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            ''',
            'events': '''
                CREATE TABLE IF NOT EXISTS {schema}.{table} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    event_date DATE,
                    start_time TIME,
                    end_time TIME,
                    location VARCHAR(255),
                    capacity INTEGER,
                    registered_count INTEGER DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'planned',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            ''',
            'volunteers': '''
                CREATE TABLE IF NOT EXISTS {schema}.{table} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    contact_id UUID,
                    volunteer_name VARCHAR(255),
                    email VARCHAR(255),
                    phone VARCHAR(50),
                    skills TEXT,
                    availability TEXT,
                    hours_logged INTEGER DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'active',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            '''
        }

        if table_name not in table_schemas:
            raise ValueError(f"Unsupported table type: {table_name}")

        # Create schema if it doesn't exist
        await self.db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))

        # Create table
        create_sql = table_schemas[table_name].format(schema=schema_name, table=table_name)
        await self.db.execute(text(create_sql))
        await self.db.commit()

    async def _import_records(
        self,
        schema_name: str,
        table_name: str,
        records: List[Dict[str, Any]]
    ) -> int:
        """Import records to database"""

        if not records:
            return 0

        # Get field names from first record (excluding timestamps)
        sample_record = records[0]
        field_names = [k for k in sample_record.keys() if k not in ['created_at', 'updated_at']]

        # Build INSERT query
        placeholders = ', '.join([f':{field}' for field in field_names])
        fields_str = ', '.join(field_names)

        insert_sql = f"""
            INSERT INTO {schema_name}.{table_name}
            ({fields_str}, created_at, updated_at)
            VALUES ({placeholders}, NOW(), NOW())
        """

        # Insert records in batches
        batch_size = 100
        total_imported = 0

        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]

            for record in batch:
                # Remove timestamp fields since we're adding them in SQL
                record_data = {k: v for k, v in record.items()
                             if k not in ['created_at', 'updated_at']}

                try:
                    await self.db.execute(text(insert_sql), record_data)
                    total_imported += 1
                except Exception as e:
                    logger.warning(f"Failed to insert record: {str(e)}")
                    # Continue with other records

            # Commit batch
            await self.db.commit()

        return total_imported

    async def preview_csv_import(
        self,
        file_path: str,
        field_mappings: Dict[str, str]
    ) -> Dict[str, Any]:
        """Preview CSV import without actually importing"""

        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            # Read first 10 rows for preview
            df = pd.read_csv(file_path, nrows=10)

            # Apply mapping
            mapped_preview = self._map_csv_data(df, field_mappings)

            # Get column info
            column_info = []
            for col in df.columns:
                mapped_to = field_mappings.get(col, 'Not mapped')
                sample_values = df[col].dropna().head(3).tolist()

                column_info.append({
                    'csv_column': col,
                    'mapped_to': mapped_to,
                    'sample_values': sample_values,
                    'data_type': str(df[col].dtype)
                })

            return {
                "success": True,
                "total_rows": len(df),
                "preview_data": mapped_preview,
                "column_mappings": column_info,
                "file_path": file_path
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def get_default_field_mappings(self, table_name: str) -> Dict[str, List[str]]:
        """Get suggested field mappings for common CSV column names"""

        mappings = {
            'contacts': {
                'first_name': ['first name', 'firstname', 'fname', 'given name'],
                'last_name': ['last name', 'lastname', 'lname', 'surname', 'family name'],
                'email': ['email', 'email address', 'e-mail', 'e_mail'],
                'phone': ['phone', 'phone number', 'telephone', 'mobile', 'cell'],
                'organization': ['organization', 'company', 'org', 'employer'],
                'address': ['address', 'street', 'street address', 'address1'],
                'city': ['city', 'town'],
                'state': ['state', 'province', 'region'],
                'zip': ['zip', 'zipcode', 'postal code', 'postcode'],
                'notes': ['notes', 'comments', 'remarks']
            },
            'donations': {
                'donor_name': ['donor', 'donor name', 'name', 'contributor'],
                'amount': ['amount', 'donation', 'gift', 'contribution', 'value'],
                'donation_date': ['date', 'donation date', 'gift date', 'when'],
                'campaign': ['campaign', 'fund', 'appeal', 'source'],
                'method': ['method', 'payment method', 'how', 'type'],
                'notes': ['notes', 'comments', 'memo']
            },
            'events': {
                'name': ['name', 'event name', 'title', 'event'],
                'description': ['description', 'details', 'about'],
                'event_date': ['date', 'event date', 'when'],
                'location': ['location', 'venue', 'where', 'place'],
                'capacity': ['capacity', 'max', 'limit', 'spaces'],
                'notes': ['notes', 'comments', 'details']
            },
            'volunteers': {
                'volunteer_name': ['name', 'volunteer name', 'volunteer'],
                'email': ['email', 'email address', 'e-mail'],
                'phone': ['phone', 'phone number', 'telephone'],
                'skills': ['skills', 'abilities', 'experience'],
                'availability': ['availability', 'when available', 'schedule'],
                'notes': ['notes', 'comments', 'remarks']
            }
        }

        return mappings.get(table_name, {})

    def auto_detect_mappings(
        self,
        file_path: str,
        table_name: str
    ) -> Dict[str, str]:
        """Auto-detect field mappings based on column names"""

        try:
            # Read just the header
            df = pd.read_csv(file_path, nrows=0)
            csv_columns = [col.lower().strip() for col in df.columns]

            # Get default mappings
            default_mappings = self.get_default_field_mappings(table_name)

            detected_mappings = {}

            for db_field, possible_names in default_mappings.items():
                for csv_col in csv_columns:
                    if csv_col in [name.lower() for name in possible_names]:
                        # Find the original column name (with proper case)
                        original_col = df.columns[csv_columns.index(csv_col)]
                        detected_mappings[original_col] = db_field
                        break

            return detected_mappings

        except Exception as e:
            logger.error(f"Error auto-detecting mappings: {str(e)}")
            return {}


# Helper function for API routes
async def import_csv_for_client(
    db: AsyncSession,
    client_id: str,
    file_path: str,
    table_name: str,
    field_mappings: Dict[str, str]
) -> Dict[str, Any]:
    """Convenience function for importing CSV files"""

    importer = BasicDataImporter(db)
    return await importer.import_csv_file(client_id, file_path, table_name, field_mappings)