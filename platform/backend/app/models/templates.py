"""
Template system for different organization types
Allows rapid deployment of proven CRM configurations
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from enum import Enum


class OrganizationType(str, Enum):
    """Supported organization types"""
    CBD = "cbd"  # Community Benefit District (like SOMA West)
    NONPROFIT = "nonprofit"  # General nonprofit
    FOUNDATION = "foundation"  # Private foundation
    BID = "bid"  # Business Improvement District
    COMMUNITY_ORG = "community_org"  # Community organization


class EntityType(str, Enum):
    """Core entity types across all organizations"""
    CONTACTS = "contacts"
    EVENTS = "events"
    SERVICE_REQUESTS = "service_requests"
    DONATIONS = "donations"
    GRANTS = "grants"
    VOLUNTEERS = "volunteers"
    PROJECTS = "projects"


class FieldType(str, Enum):
    """Field types for dynamic model generation"""
    STRING = "string"
    TEXT = "text"
    INTEGER = "integer"
    DECIMAL = "decimal"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    EMAIL = "email"
    PHONE = "phone"
    URL = "url"
    CHOICE = "choice"
    JSON = "json"


class FieldDefinition(BaseModel):
    """Definition of a field in an entity"""
    name: str
    type: FieldType
    required: bool = False
    unique: bool = False
    max_length: Optional[int] = None
    choices: Optional[List[str]] = None
    default: Optional[Any] = None
    description: Optional[str] = None


class WorkflowStage(BaseModel):
    """Stage in a workflow (e.g., service request stages)"""
    name: str
    color: str  # hex color for UI
    order: int
    description: Optional[str] = None


class EntityTemplate(BaseModel):
    """Template for an entity type within an organization"""
    name: str  # "Contact", "Service Request", etc.
    plural_name: str  # "Contacts", "Service Requests"
    fields: List[FieldDefinition]
    enable_workflow: bool = False
    workflow_stages: List[WorkflowStage] = []
    list_view_fields: List[str] = []  # Fields to show in list view
    search_fields: List[str] = []  # Fields to search
    export_fields: List[str] = []  # Fields to include in exports


class BrandingConfig(BaseModel):
    """Branding configuration for client"""
    primary_color: str = "#4A9B8E"
    secondary_color: str = "#043353"
    accent_color: str = "#18A4E0"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    organization_name: str
    tagline: Optional[str] = None


class OrganizationTemplate(BaseModel):
    """Complete template for an organization type"""
    name: str
    description: str
    organization_type: OrganizationType

    # Core configuration
    enabled_entities: List[EntityType]
    entity_templates: Dict[str, EntityTemplate]

    # Branding defaults
    default_branding: BrandingConfig

    # Features
    features: Dict[str, bool] = {
        "voice_interface": False,
        "mobile_app": True,
        "analytics_dashboard": True,
        "export_capabilities": True,
        "custom_reports": False,
        "integrations": False,
    }

    # Pricing
    recommended_plan: str = "small"
    setup_complexity: int = 1  # 1-5 scale
    estimated_setup_hours: int = 4


# Template definitions
SOMA_WEST_TEMPLATE = OrganizationTemplate(
    name="Community Benefit District",
    description="Operations management for CBDs and BIDs with service request tracking, event management, and stakeholder coordination",
    organization_type=OrganizationType.CBD,

    enabled_entities=[
        EntityType.CONTACTS,
        EntityType.SERVICE_REQUESTS,
        EntityType.EVENTS,
    ],

    entity_templates={
        "contacts": EntityTemplate(
            name="Contact",
            plural_name="Contacts",
            fields=[
                # Basic Info
                FieldDefinition(name="first_name", type=FieldType.STRING, required=True, max_length=100),
                FieldDefinition(name="last_name", type=FieldType.STRING, required=True, max_length=100),
                FieldDefinition(name="email", type=FieldType.EMAIL, unique=True, max_length=255),
                FieldDefinition(name="phone", type=FieldType.PHONE, max_length=50),

                # Enhanced Contact Details
                FieldDefinition(name="company", type=FieldType.STRING, max_length=255),
                FieldDefinition(name="title", type=FieldType.STRING, max_length=100),
                FieldDefinition(name="mobile_phone", type=FieldType.PHONE, max_length=50),
                FieldDefinition(name="preferred_contact_method", type=FieldType.CHOICE, choices=[
                    "Email", "Phone", "Text", "Mail"
                ]),

                # Address Info
                FieldDefinition(name="address", type=FieldType.STRING, max_length=255),
                FieldDefinition(name="city", type=FieldType.STRING, max_length=100),
                FieldDefinition(name="state", type=FieldType.STRING, max_length=100),
                FieldDefinition(name="zip_code", type=FieldType.STRING, max_length=20),

                # Contact Types (from actual SOMA West)
                FieldDefinition(name="contact_types", type=FieldType.JSON, choices=[
                    "Prospect", "Donor", "Volunteer", "Board Member", "Staff",
                    "Vendor", "Writer/Artist"
                ]),

                # Flexible fields
                FieldDefinition(name="properties", type=FieldType.JSON, description="Multiple properties array"),
                FieldDefinition(name="tags", type=FieldType.JSON, description="Flexible tagging system"),

                # CRM Pipeline
                FieldDefinition(name="pipeline_stage", type=FieldType.CHOICE, choices=[
                    "Not applicable", "Identified", "Qualified", "Cultivated", "Solicited", "Stewarded"
                ]),
                FieldDefinition(name="giving_capacity", type=FieldType.DECIMAL),
                FieldDefinition(name="source", type=FieldType.STRING, max_length=100),
                FieldDefinition(name="notes", type=FieldType.TEXT, max_length=4000),
            ],
            list_view_fields=["first_name", "last_name", "email", "contact_types", "company"],
            search_fields=["first_name", "last_name", "email", "company"],
            export_fields=["first_name", "last_name", "email", "phone", "contact_types", "company", "address"],
        ),

        "service_requests": EntityTemplate(
            name="Service Request",
            plural_name="Service Requests",
            fields=[
                # Location Details
                FieldDefinition(name="location", type=FieldType.STRING, required=True, max_length=255),
                FieldDefinition(name="cross_street", type=FieldType.STRING, max_length=255),

                # Request Classification
                FieldDefinition(name="request_type", type=FieldType.CHOICE, required=True, choices=[
                    "Trash Pickup", "Sweeping", "Hazardous Material", "Graffiti Removal",
                    "Landscaping", "Safety Issue", "Other"
                ]),
                FieldDefinition(name="priority", type=FieldType.CHOICE, choices=[
                    "Routine", "High", "Urgent", "Hazardous"
                ], default="Routine"),
                FieldDefinition(name="description", type=FieldType.TEXT, required=True, max_length=4000),

                # Status and Workflow
                FieldDefinition(name="status", type=FieldType.CHOICE, choices=[
                    "Reported", "In Progress", "Completed"
                ], default="Reported"),

                # Assignment and Crew
                FieldDefinition(name="assigned_to", type=FieldType.STRING, max_length=100),
                FieldDefinition(name="crew_type", type=FieldType.STRING, max_length=50),

                # Timing and Metrics
                FieldDefinition(name="reported_date", type=FieldType.DATETIME, required=True),
                FieldDefinition(name="completed_date", type=FieldType.DATETIME),
                FieldDefinition(name="time_to_complete", type=FieldType.INTEGER, description="Minutes to complete"),

                # Weight tracking (important for CBD metrics)
                FieldDefinition(name="weight_collected", type=FieldType.DECIMAL, description="Weight in pounds"),

                # Reporter Contact Link
                FieldDefinition(name="reporter_contact_id", type=FieldType.STRING, description="UUID of reporter contact"),
            ],
            enable_workflow=True,
            workflow_stages=[
                WorkflowStage(name="Reported", color="#dc2626", order=1),
                WorkflowStage(name="In Progress", color="#18A4E0", order=2),
                WorkflowStage(name="Completed", color="#16a34a", order=3),
            ],
            list_view_fields=["location", "request_type", "priority", "status", "assigned_to", "reported_date"],
            search_fields=["location", "cross_street", "description"],
            export_fields=["location", "cross_street", "request_type", "priority", "description", "assigned_to", "status", "reported_date", "completed_date", "weight_collected"],
        ),

        "events": EntityTemplate(
            name="Event",
            plural_name="Events",
            fields=[
                FieldDefinition(name="title", type=FieldType.STRING, required=True, max_length=255),
                FieldDefinition(name="description", type=FieldType.TEXT),
                FieldDefinition(name="event_type", type=FieldType.CHOICE, choices=[
                    "Community Events", "Meetings", "Cleanup Days", "Fundraisers", "Street Activation"
                ]),
                FieldDefinition(name="start_date", type=FieldType.DATETIME, required=True),
                FieldDefinition(name="end_date", type=FieldType.DATETIME),
                FieldDefinition(name="location", type=FieldType.STRING, max_length=255),
                FieldDefinition(name="estimated_attendance", type=FieldType.INTEGER),
                FieldDefinition(name="actual_attendance", type=FieldType.INTEGER),
                FieldDefinition(name="organizer", type=FieldType.STRING, max_length=255),
            ],
            enable_workflow=True,
            workflow_stages=[
                WorkflowStage(name="Planning", color="#eab308", order=1),
                WorkflowStage(name="Confirmed", color="#18A4E0", order=2),
                WorkflowStage(name="Completed", color="#16a34a", order=3),
                WorkflowStage(name="Cancelled", color="#dc2626", order=4),
            ],
            list_view_fields=["title", "event_type", "start_date", "location", "status"],
            search_fields=["title", "description", "location"],
            export_fields=["title", "description", "event_type", "start_date", "end_date", "location", "estimated_attendance", "actual_attendance"],
        ),
    },

    default_branding=BrandingConfig(
        primary_color="#043353",  # SOMA West Navy
        accent_color="#18A4E0",   # SOMA West Blue
        organization_name="Community Benefit District",
    ),

    features={
        "voice_interface": False,
        "mobile_app": True,
        "analytics_dashboard": True,
        "export_capabilities": True,
        "custom_reports": True,
        "integrations": False,
    },

    recommended_plan="medium",  # $1000 setup + $1000/month
    setup_complexity=3,
    estimated_setup_hours=6,
)


NONPROFIT_TEMPLATE = OrganizationTemplate(
    name="Nonprofit Organization",
    description="Complete nonprofit management with donor tracking, volunteer coordination, and program management",
    organization_type=OrganizationType.NONPROFIT,

    enabled_entities=[
        EntityType.CONTACTS,
        EntityType.DONATIONS,
        EntityType.VOLUNTEERS,
        EntityType.EVENTS,
        EntityType.GRANTS,
    ],

    entity_templates={
        "contacts": EntityTemplate(
            name="Contact",
            plural_name="Contacts",
            fields=[
                FieldDefinition(name="first_name", type=FieldType.STRING, required=True, max_length=100),
                FieldDefinition(name="last_name", type=FieldType.STRING, required=True, max_length=100),
                FieldDefinition(name="email", type=FieldType.EMAIL, unique=True),
                FieldDefinition(name="phone", type=FieldType.PHONE),
                FieldDefinition(name="contact_type", type=FieldType.CHOICE, choices=[
                    "Donor", "Volunteer", "Board Member", "Staff", "Vendor", "Beneficiary"
                ]),
                FieldDefinition(name="giving_capacity", type=FieldType.DECIMAL),
                FieldDefinition(name="pipeline_stage", type=FieldType.CHOICE, choices=[
                    "Identified", "Qualified", "Cultivated", "Solicited", "Stewarded"
                ]),
            ],
            list_view_fields=["first_name", "last_name", "email", "contact_type", "pipeline_stage"],
            search_fields=["first_name", "last_name", "email"],
            export_fields=["first_name", "last_name", "email", "phone", "contact_type", "giving_capacity"],
        ),
        # Add other nonprofit entities...
    },

    default_branding=BrandingConfig(
        primary_color="#4A9B8E",
        accent_color="#18A4E0",
        organization_name="Nonprofit Organization",
    ),

    recommended_plan="small",
    setup_complexity=2,
    estimated_setup_hours=4,
)


# Template registry
AVAILABLE_TEMPLATES = {
    "cbd": SOMA_WEST_TEMPLATE,
    "nonprofit": NONPROFIT_TEMPLATE,
}


def get_template(template_id: str) -> Optional[OrganizationTemplate]:
    """Get template by ID"""
    return AVAILABLE_TEMPLATES.get(template_id)


def list_templates() -> List[OrganizationTemplate]:
    """List all available templates"""
    return list(AVAILABLE_TEMPLATES.values())