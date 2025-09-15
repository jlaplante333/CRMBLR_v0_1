"""
AI-Driven Data Processing Pipeline for CRMBLR Platform
Takes unstructured nonprofit data and automatically creates organized CRM modules

WORKFLOW:
1. Client uploads messy Excel/CSV files, emails, documents
2. AI analyzes data to understand organization type and needs
3. System creates structured tables from unstructured data
4. Tables are automatically mapped to appropriate CRM modules
5. Client gets fully configured CRM with their data pre-loaded
"""

import os
import json
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import openai
from elasticsearch import Elasticsearch

from ..models.ultra_flexible_templates import get_template, get_module, ALL_MODULES
from ..core.config import settings


class DataSource(str, Enum):
    """Types of data sources clients might have"""
    EXCEL_SPREADSHEET = "excel"
    CSV_FILE = "csv"
    EMAIL_EXPORT = "email"
    CONTACT_LIST = "contact_list"
    FINANCIAL_RECORDS = "financial"
    EVENT_CALENDAR = "calendar"
    DONOR_DATABASE = "donor_db"
    VOLUNTEER_LIST = "volunteer_list"
    GRANT_RECORDS = "grant_records"
    SERVICE_LOGS = "service_logs"


@dataclass
class DataAnalysisResult:
    """Result of AI analyzing uploaded data"""
    organization_type: str  # "nonprofit", "cbd", "foundation", etc.
    confidence: float  # 0-1 confidence in classification

    # Detected entity types in their data
    detected_entities: Dict[str, Dict[str, Any]]  # entity_name -> {sample_data, field_mapping}

    # Suggested modules based on data analysis
    suggested_modules: List[str]

    # Data quality assessment
    data_quality: Dict[str, float]  # table_name -> quality_score (0-1)

    # Recommended configuration
    recommended_config: Dict[str, Any]


class AIDataProcessor:
    """Processes unstructured nonprofit data using AI"""

    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.es_client = Elasticsearch([settings.ELASTICSEARCH_URL]) if settings.ELASTICSEARCH_URL else None

    async def process_client_data(self, client_id: str, uploaded_files: List[Dict]) -> DataAnalysisResult:
        """
        Main entry point: process all uploaded data for a client
        Returns analysis and recommended configuration
        """

        # Step 1: Load and analyze all data files
        raw_data = await self._load_data_files(uploaded_files)

        # Step 2: Use AI to understand organization type and structure
        org_analysis = await self._analyze_organization_type(raw_data)

        # Step 3: Extract structured entities from unstructured data
        extracted_entities = await self._extract_entities(raw_data, org_analysis)

        # Step 4: Map entities to CRM modules
        module_mapping = await self._map_entities_to_modules(extracted_entities, org_analysis)

        # Step 5: Generate recommended configuration
        recommended_config = await self._generate_configuration(
            org_analysis, extracted_entities, module_mapping
        )

        return DataAnalysisResult(
            organization_type=org_analysis["type"],
            confidence=org_analysis["confidence"],
            detected_entities=extracted_entities,
            suggested_modules=module_mapping["suggested_modules"],
            data_quality=module_mapping["data_quality"],
            recommended_config=recommended_config
        )

    async def _load_data_files(self, uploaded_files: List[Dict]) -> Dict[str, pd.DataFrame]:
        """Load and parse uploaded files into DataFrames"""
        raw_data = {}

        for file_info in uploaded_files:
            file_path = file_info["path"]
            file_name = file_info["name"]

            try:
                if file_path.endswith(('.xlsx', '.xls')):
                    # Handle multiple sheets
                    excel_file = pd.ExcelFile(file_path)
                    for sheet_name in excel_file.sheet_names:
                        df = pd.read_excel(file_path, sheet_name=sheet_name)
                        key = f"{file_name}_{sheet_name}" if len(excel_file.sheet_names) > 1 else file_name
                        raw_data[key] = df

                elif file_path.endswith('.csv'):
                    df = pd.read_csv(file_path)
                    raw_data[file_name] = df

                # TODO: Add support for other formats (JSON, email exports, etc.)

            except Exception as e:
                print(f"Error loading {file_name}: {e}")
                continue

        return raw_data

    async def _analyze_organization_type(self, raw_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Use AI to determine organization type from data patterns"""

        # Prepare data summary for AI analysis
        data_summary = {}
        for table_name, df in raw_data.items():
            data_summary[table_name] = {
                "columns": list(df.columns),
                "sample_data": df.head(3).to_dict('records') if not df.empty else [],
                "row_count": len(df)
            }

        prompt = f"""
        Analyze this nonprofit organization's data to determine their type and focus.

        Data Summary:
        {json.dumps(data_summary, indent=2, default=str)}

        Determine:
        1. Organization type (nonprofit, cbd, foundation, social_services, arts, etc.)
        2. Primary activities (fundraising, service_delivery, grant_making, etc.)
        3. Confidence level (0-1)
        4. Key focus areas

        Return JSON:
        {{
            "type": "organization_type",
            "confidence": 0.0-1.0,
            "primary_activities": ["activity1", "activity2"],
            "focus_areas": ["area1", "area2"],
            "reasoning": "explanation of analysis"
        }}
        """

        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        try:
            analysis = json.loads(response.choices[0].message.content)
            return analysis
        except:
            # Fallback if AI response isn't valid JSON
            return {
                "type": "nonprofit",
                "confidence": 0.5,
                "primary_activities": ["general"],
                "focus_areas": ["community"],
                "reasoning": "Default fallback analysis"
            }

    async def _extract_entities(self, raw_data: Dict[str, pd.DataFrame], org_analysis: Dict) -> Dict[str, Dict]:
        """Extract structured entities from unstructured data"""

        extracted_entities = {}

        for table_name, df in raw_data.items():
            if df.empty:
                continue

            # Use AI to identify what this data represents
            entity_analysis = await self._identify_entity_type(table_name, df, org_analysis)

            if entity_analysis["entity_type"] != "unknown":
                # Clean and structure the data
                cleaned_data = await self._clean_and_structure_data(df, entity_analysis)

                extracted_entities[entity_analysis["entity_type"]] = {
                    "source_table": table_name,
                    "entity_type": entity_analysis["entity_type"],
                    "field_mapping": entity_analysis["field_mapping"],
                    "cleaned_data": cleaned_data,
                    "sample_records": cleaned_data.head(5).to_dict('records') if not cleaned_data.empty else [],
                    "record_count": len(cleaned_data)
                }

        return extracted_entities

    async def _identify_entity_type(self, table_name: str, df: pd.DataFrame, org_analysis: Dict) -> Dict:
        """Use AI to identify what type of entity this data represents"""

        sample_data = df.head(5).to_dict('records') if not df.empty else []

        prompt = f"""
        Identify what type of CRM entity this data represents for a {org_analysis['type']} organization.

        Table: {table_name}
        Columns: {list(df.columns)}
        Sample Data: {json.dumps(sample_data, default=str, indent=2)}

        Organization Context: {org_analysis['reasoning']}

        Possible entity types:
        - contacts (people/individuals)
        - organizations (institutions/companies)
        - donations (financial contributions)
        - grants (funding applications/awards)
        - events (meetings/activities)
        - service_requests (work orders/tasks)
        - activities (interactions/communications)
        - volunteers (people offering time)
        - unknown (if data doesn't fit standard entities)

        Return JSON:
        {{
            "entity_type": "entity_name",
            "confidence": 0.0-1.0,
            "field_mapping": {{
                "original_column": "standard_field_name"
            }},
            "reasoning": "why this classification was chosen"
        }}
        """

        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        try:
            return json.loads(response.choices[0].message.content)
        except:
            return {
                "entity_type": "unknown",
                "confidence": 0.0,
                "field_mapping": {},
                "reasoning": "Could not parse AI response"
            }

    async def _clean_and_structure_data(self, df: pd.DataFrame, entity_analysis: Dict) -> pd.DataFrame:
        """Clean and standardize data based on entity type"""

        cleaned_df = df.copy()
        field_mapping = entity_analysis.get("field_mapping", {})

        # Apply field mapping (rename columns to standard names)
        if field_mapping:
            cleaned_df = cleaned_df.rename(columns=field_mapping)

        # Entity-specific cleaning
        entity_type = entity_analysis["entity_type"]

        if entity_type == "contacts":
            cleaned_df = self._clean_contact_data(cleaned_df)
        elif entity_type == "donations":
            cleaned_df = self._clean_donation_data(cleaned_df)
        elif entity_type == "service_requests":
            cleaned_df = self._clean_service_request_data(cleaned_df)

        # General cleaning
        cleaned_df = self._general_data_cleaning(cleaned_df)

        return cleaned_df

    def _clean_contact_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Specific cleaning for contact data"""
        # Split full names if needed
        if 'full_name' in df.columns and 'first_name' not in df.columns:
            df[['first_name', 'last_name']] = df['full_name'].str.split(' ', 1, expand=True)

        # Standardize email format
        if 'email' in df.columns:
            df['email'] = df['email'].str.lower().str.strip()

        # Clean phone numbers
        if 'phone' in df.columns:
            df['phone'] = df['phone'].astype(str).str.replace(r'[^\d]', '', regex=True)

        return df

    def _clean_donation_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Specific cleaning for donation data"""
        # Clean monetary amounts
        money_columns = ['amount', 'donation_amount', 'gift_amount']
        for col in money_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.replace(r'[\$,]', '', regex=True)
                df[col] = pd.to_numeric(df[col], errors='coerce')

        # Standardize dates
        date_columns = ['date', 'gift_date', 'donation_date']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')

        return df

    def _clean_service_request_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Specific cleaning for service request data"""
        # Standardize status values
        if 'status' in df.columns:
            status_mapping = {
                'open': 'Reported',
                'in progress': 'In Progress',
                'completed': 'Completed',
                'closed': 'Completed'
            }
            df['status'] = df['status'].str.lower().map(status_mapping).fillna(df['status'])

        return df

    def _general_data_cleaning(self, df: pd.DataFrame) -> pd.DataFrame:
        """General data cleaning applied to all entities"""
        # Remove completely empty rows
        df = df.dropna(how='all')

        # Strip whitespace from string columns
        string_columns = df.select_dtypes(include=['object']).columns
        df[string_columns] = df[string_columns].apply(lambda x: x.str.strip() if x.dtype == "object" else x)

        # Replace empty strings with NaN
        df = df.replace('', pd.NA)

        return df

    async def _map_entities_to_modules(self, extracted_entities: Dict, org_analysis: Dict) -> Dict:
        """Map extracted entities to appropriate CRM modules"""

        entity_to_module_mapping = {
            "contacts": "contacts",
            "organizations": "organizations",
            "donations": "donations",
            "grants": "grants",
            "events": "events",
            "service_requests": "service_requests",
            "activities": "activities",
            "volunteers": "contacts"  # Volunteers are a type of contact
        }

        suggested_modules = ["contacts", "activities"]  # Always include these
        data_quality = {}

        for entity_name, entity_data in extracted_entities.items():
            # Map entity to module
            module_id = entity_to_module_mapping.get(entity_name)
            if module_id and module_id not in suggested_modules:
                suggested_modules.append(module_id)

            # Assess data quality
            quality_score = self._assess_data_quality(entity_data["cleaned_data"])
            data_quality[entity_name] = quality_score

        # Add organization type specific modules
        org_type = org_analysis["type"]
        if org_type == "cbd":
            if "service_requests" not in suggested_modules:
                suggested_modules.append("service_requests")
            if "events" not in suggested_modules:
                suggested_modules.append("events")
        elif org_type in ["nonprofit", "foundation"]:
            if "donations" not in suggested_modules:
                suggested_modules.append("donations")

        return {
            "suggested_modules": suggested_modules,
            "data_quality": data_quality,
            "entity_module_mapping": {k: entity_to_module_mapping.get(k) for k in extracted_entities.keys()}
        }

    def _assess_data_quality(self, df: pd.DataFrame) -> float:
        """Assess quality of cleaned data (0-1 score)"""
        if df.empty:
            return 0.0

        # Calculate completeness (non-null percentage)
        completeness = 1 - (df.isnull().sum().sum() / (len(df) * len(df.columns)))

        # Calculate uniqueness (for key fields like email)
        uniqueness = 1.0
        if 'email' in df.columns:
            email_uniqueness = df['email'].nunique() / len(df['email'].dropna())
            uniqueness = min(uniqueness, email_uniqueness)

        # Overall quality score
        quality_score = (completeness * 0.7) + (uniqueness * 0.3)
        return min(1.0, max(0.0, quality_score))

    async def _generate_configuration(self, org_analysis: Dict, extracted_entities: Dict, module_mapping: Dict) -> Dict:
        """Generate complete CRM configuration based on analysis"""

        # Determine template based on organization type
        template_id = org_analysis["type"]
        if template_id not in ["cbd", "nonprofit"]:
            template_id = "nonprofit"  # Default fallback

        template = get_template(template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found")

        config = {
            "template_id": template_id,
            "template_name": template.name,
            "modules": {},
            "entities": {},
            "data_migration": {},
            "branding": {
                "organization_name": "TBD",  # Will be filled during setup call
                "primary_color": "#4A9B8E",  # Default
                "accent_color": "#18A4E0"    # Default
            }
        }

        # Configure modules based on analysis
        for module_id in module_mapping["suggested_modules"]:
            module = get_module(module_id)
            if module:
                config["modules"][module_id] = {
                    "enabled": True,
                    "configuration": {},
                    "data_source": None
                }

                # Add module entities
                for entity_name, entity_def in module.base_entities.items():
                    config["entities"][entity_name] = entity_def.copy()

        # Map extracted data to entities
        for entity_name, entity_data in extracted_entities.items():
            if entity_name in config["entities"]:
                config["data_migration"][entity_name] = {
                    "source_table": entity_data["source_table"],
                    "field_mapping": entity_data["field_mapping"],
                    "record_count": entity_data["record_count"],
                    "data_quality": module_mapping["data_quality"].get(entity_name, 0.0)
                }

        return config


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

async def process_nonprofit_data_example():
    """Example of how the AI data processor would be used"""

    processor = AIDataProcessor()

    # Simulate uploaded files from a nonprofit
    uploaded_files = [
        {
            "name": "donor_list.xlsx",
            "path": "/tmp/uploads/donor_list.xlsx"
        },
        {
            "name": "volunteer_hours.csv",
            "path": "/tmp/uploads/volunteer_hours.csv"
        },
        {
            "name": "event_attendance.xlsx",
            "path": "/tmp/uploads/event_attendance.xlsx"
        }
    ]

    # Process the data
    analysis_result = await processor.process_client_data("client123", uploaded_files)

    print(f"Organization Type: {analysis_result.organization_type}")
    print(f"Confidence: {analysis_result.confidence}")
    print(f"Suggested Modules: {analysis_result.suggested_modules}")
    print(f"Detected Entities: {list(analysis_result.detected_entities.keys())}")

    # The recommended_config can now be used to deploy their CRM
    return analysis_result.recommended_config


# This is the magic: Messy Excel files → AI Analysis → Configured CRM with data loaded