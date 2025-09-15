"""
Ultra-Flexible Template System for CRMBLR Platform
Based on analysis of CRM v2's modular architecture and SOMA West's operational needs
Allows clients to mix and match functional modules for their specific requirements
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from enum import Enum


class ModuleCategory(str, Enum):
    """Categories of CRM modules"""
    CORE = "core"                    # Essential for all organizations
    RELATIONSHIPS = "relationships"  # Contact/organization management
    OPERATIONS = "operations"        # Day-to-day work management
    FUNDRAISING = "fundraising"      # Revenue generation
    COMPLIANCE = "compliance"        # Reporting/legal requirements
    ANALYTICS = "analytics"          # Data analysis and insights


class CRMModule(BaseModel):
    """A functional module that can be enabled/disabled per client"""
    id: str
    name: str
    description: str
    category: ModuleCategory

    # Dependencies
    requires_modules: List[str] = []  # Must have these modules enabled
    suggested_with: List[str] = []    # Often used together

    # Configuration
    base_entities: Dict[str, Dict] = {}      # Core entities this module provides
    extension_fields: Dict[str, List] = {}   # Fields it adds to other entities
    workflows: List[Dict] = []               # Business processes

    # Customization
    configurable_choices: Dict[str, List] = {}  # User-customizable dropdown options
    optional_fields: List[Dict] = []            # Fields client can choose to enable

    # Complexity and pricing
    setup_complexity: int = 1  # 1-5 scale
    recommended_plan: str = "small"  # small/medium/unlimited


# ============================================================================
# CORE MODULES (Required for all clients)
# ============================================================================

CONTACTS_MODULE = CRMModule(
    id="contacts",
    name="Contact Management",
    description="Individual people and relationship tracking",
    category=ModuleCategory.CORE,

    base_entities={
        "contacts": {
            "name": "Contact",
            "plural": "Contacts",
            "fields": [
                {"name": "first_name", "type": "string", "required": True},
                {"name": "last_name", "type": "string", "required": True},
                {"name": "email", "type": "email"},
                {"name": "phone", "type": "phone"},
                {"name": "address", "type": "json", "description": "Flexible address object"},
            ]
        }
    },

    configurable_choices={
        "contact_types": [
            # Default suggestions, client can modify
            "Donor", "Volunteer", "Board Member", "Staff", "Vendor",
            "Property Owner", "Business Owner", "Ambassador", "City Official"
        ],
        "contact_sources": [
            "Website", "Event", "Referral", "Social Media", "Cold Outreach"
        ]
    },

    optional_fields=[
        {"name": "contact_types", "type": "json_array", "label": "Contact Types (multiple)"},
        {"name": "tags", "type": "json_array", "label": "Flexible Tags"},
        {"name": "source", "type": "string", "label": "How they found us"},
        {"name": "notes", "type": "text", "label": "General Notes"},
        {"name": "preferred_contact_method", "type": "choice", "choices": ["Email", "Phone", "Text", "Mail"]},
    ]
)

ACTIVITIES_MODULE = CRMModule(
    id="activities",
    name="Activity Logging",
    description="Track interactions and communications",
    category=ModuleCategory.CORE,
    requires_modules=["contacts"],

    base_entities={
        "activities": {
            "name": "Activity",
            "plural": "Activities",
            "fields": [
                {"name": "contact_id", "type": "reference", "reference": "contacts"},
                {"name": "activity_type", "type": "choice", "required": True},
                {"name": "date", "type": "datetime", "required": True},
                {"name": "description", "type": "text", "required": True},
                {"name": "outcome", "type": "choice"},
            ]
        }
    },

    configurable_choices={
        "activity_types": [
            "Phone Call", "Email", "Meeting", "Event", "Site Visit", "Follow-up"
        ],
        "outcomes": [
            "Positive", "Neutral", "Negative", "No Response", "Needs Follow-up"
        ]
    }
)

# ============================================================================
# OPERATIONS MODULES (CBD, Service Organizations)
# ============================================================================

SERVICE_REQUESTS_MODULE = CRMModule(
    id="service_requests",
    name="Service Request Management",
    description="Track and manage service requests with field operations",
    category=ModuleCategory.OPERATIONS,
    requires_modules=["contacts"],

    base_entities={
        "service_requests": {
            "name": "Service Request",
            "plural": "Service Requests",
            "fields": [
                {"name": "location", "type": "string", "required": True},
                {"name": "description", "type": "text", "required": True},
                {"name": "request_type", "type": "choice", "required": True},
                {"name": "priority", "type": "choice", "default": "Normal"},
                {"name": "status", "type": "choice", "default": "Reported"},
                {"name": "reported_date", "type": "datetime", "auto_now_add": True},
                {"name": "assigned_to", "type": "string"},
            ]
        }
    },

    configurable_choices={
        "request_types": [
            # CBD examples from SOMA West
            "Trash Pickup", "Graffiti Removal", "Safety Issue", "Landscaping",
            # General service examples
            "Maintenance", "Repair", "Installation", "Inspection"
        ],
        "priority_levels": [
            "Low", "Normal", "High", "Urgent", "Emergency"
        ],
        "status_stages": [
            "Reported", "Assigned", "In Progress", "Completed", "Cancelled"
        ]
    },

    optional_fields=[
        {"name": "cross_street", "type": "string", "label": "Cross Street"},
        {"name": "weight_collected", "type": "decimal", "label": "Weight Collected (lbs)"},
        {"name": "time_to_complete", "type": "integer", "label": "Minutes to Complete"},
        {"name": "crew_type", "type": "string", "label": "Crew Type"},
        {"name": "cost", "type": "decimal", "label": "Cost"},
        {"name": "completion_notes", "type": "text", "label": "Completion Notes"},
        {"name": "before_photo", "type": "file", "label": "Before Photo"},
        {"name": "after_photo", "type": "file", "label": "After Photo"},
    ],

    setup_complexity=3,
    recommended_plan="medium"
)

EVENT_MANAGEMENT_MODULE = CRMModule(
    id="events",
    name="Event Management",
    description="Plan, track, and manage events",
    category=ModuleCategory.OPERATIONS,

    base_entities={
        "events": {
            "name": "Event",
            "plural": "Events",
            "fields": [
                {"name": "title", "type": "string", "required": True},
                {"name": "description", "type": "text"},
                {"name": "start_date", "type": "datetime", "required": True},
                {"name": "end_date", "type": "datetime"},
                {"name": "location", "type": "string"},
                {"name": "status", "type": "choice", "default": "Planning"},
            ]
        }
    },

    configurable_choices={
        "event_types": [
            "Community Meeting", "Cleanup Day", "Fundraiser", "Training",
            "Board Meeting", "Social Event", "Conference", "Workshop"
        ],
        "event_status": [
            "Planning", "Confirmed", "In Progress", "Completed", "Cancelled"
        ]
    },

    optional_fields=[
        {"name": "estimated_attendance", "type": "integer", "label": "Expected Attendance"},
        {"name": "actual_attendance", "type": "integer", "label": "Actual Attendance"},
        {"name": "budget", "type": "decimal", "label": "Event Budget"},
        {"name": "actual_cost", "type": "decimal", "label": "Actual Cost"},
        {"name": "organizer", "type": "string", "label": "Event Organizer"},
    ]
)

# ============================================================================
# FUNDRAISING MODULES (Nonprofits, Foundations)
# ============================================================================

DONATIONS_MODULE = CRMModule(
    id="donations",
    name="Donation Tracking",
    description="Track donations and donor relationships",
    category=ModuleCategory.FUNDRAISING,
    requires_modules=["contacts"],

    base_entities={
        "donations": {
            "name": "Donation",
            "plural": "Donations",
            "fields": [
                {"name": "donor_contact_id", "type": "reference", "reference": "contacts", "required": True},
                {"name": "amount", "type": "decimal", "required": True},
                {"name": "date", "type": "date", "required": True},
                {"name": "payment_method", "type": "choice"},
                {"name": "campaign", "type": "string"},
            ]
        }
    },

    extension_fields={
        "contacts": [
            {"name": "donor_segment", "type": "choice", "choices": ["Prospect", "New", "Regular", "Major", "Lapsed"]},
            {"name": "total_lifetime_giving", "type": "decimal", "calculated": True},
            {"name": "last_donation_date", "type": "date", "calculated": True},
            {"name": "giving_capacity", "type": "decimal", "label": "Estimated Giving Capacity"},
        ]
    },

    configurable_choices={
        "payment_methods": [
            "Cash", "Check", "Credit Card", "Bank Transfer", "Online", "Stock", "Other"
        ],
        "donation_types": [
            "General", "Program Specific", "Capital Campaign", "Endowment", "Emergency"
        ]
    },

    recommended_plan="small"
)

GRANTS_MODULE = CRMModule(
    id="grants",
    name="Grant Management",
    description="Track grant applications and awards",
    category=ModuleCategory.FUNDRAISING,
    requires_modules=["contacts"],
    suggested_with=["organizations"],

    base_entities={
        "grants": {
            "name": "Grant",
            "plural": "Grants",
            "fields": [
                {"name": "title", "type": "string", "required": True},
                {"name": "grantor_organization", "type": "string", "required": True},
                {"name": "amount_requested", "type": "decimal"},
                {"name": "amount_awarded", "type": "decimal"},
                {"name": "application_date", "type": "date"},
                {"name": "decision_date", "type": "date"},
                {"name": "status", "type": "choice", "default": "Researching"},
            ]
        }
    },

    configurable_choices={
        "grant_status": [
            "Researching", "Preparing", "Submitted", "Under Review",
            "Awarded", "Rejected", "Withdrawn"
        ],
        "grant_types": [
            "Operating", "Program", "Capital", "Capacity Building", "Emergency"
        ]
    },

    setup_complexity=4,
    recommended_plan="medium"
)

# ============================================================================
# RELATIONSHIP MODULES
# ============================================================================

ORGANIZATIONS_MODULE = CRMModule(
    id="organizations",
    name="Organization Management",
    description="Track institutional relationships",
    category=ModuleCategory.RELATIONSHIPS,

    base_entities={
        "organizations": {
            "name": "Organization",
            "plural": "Organizations",
            "fields": [
                {"name": "name", "type": "string", "required": True},
                {"name": "organization_type", "type": "choice"},
                {"name": "website", "type": "url"},
                {"name": "address", "type": "json"},
            ]
        }
    },

    extension_fields={
        "contacts": [
            {"name": "organization_id", "type": "reference", "reference": "organizations"},
            {"name": "title", "type": "string", "label": "Job Title"},
        ]
    },

    configurable_choices={
        "organization_types": [
            "Foundation", "Corporation", "Government", "Nonprofit",
            "University", "Museum", "Hospital", "Other"
        ]
    }
)

# ============================================================================
# TEMPLATE COMBINATIONS
# ============================================================================

class OrganizationTemplate(BaseModel):
    """Complete template combining multiple modules"""
    id: str
    name: str
    description: str
    target_organizations: List[str]

    # Modules
    required_modules: List[str]
    suggested_modules: List[str]
    optional_modules: List[str]

    # Configuration
    setup_questions: List[Dict]
    estimated_setup_time: str
    recommended_plan: str


CBD_TEMPLATE = OrganizationTemplate(
    id="cbd",
    name="Community Benefit District",
    description="Operations management for CBDs and BIDs",
    target_organizations=["Community Benefit Districts", "Business Improvement Districts", "Property Management"],

    required_modules=["contacts", "activities", "service_requests", "events"],
    suggested_modules=["organizations"],
    optional_modules=["grants", "donations"],

    setup_questions=[
        {
            "question": "What types of service requests do you handle?",
            "module": "service_requests",
            "field": "request_types",
            "type": "multi_choice_custom",
            "default": ["Trash Pickup", "Graffiti Removal", "Safety Issue", "Landscaping"]
        },
        {
            "question": "How do you prioritize requests?",
            "module": "service_requests",
            "field": "priority_levels",
            "type": "multi_choice_custom",
            "default": ["Routine", "High", "Urgent", "Hazardous"]
        },
        {
            "question": "What information do you track for each request?",
            "module": "service_requests",
            "field": "optional_fields",
            "type": "multi_select",
            "options": ["weight_collected", "time_to_complete", "crew_type", "cost", "photos"]
        }
    ],

    estimated_setup_time="3-5 days",
    recommended_plan="medium"
)

NONPROFIT_TEMPLATE = OrganizationTemplate(
    id="nonprofit",
    name="Nonprofit Organization",
    description="Complete nonprofit management with fundraising focus",
    target_organizations=["Nonprofits", "Charities", "Social Services", "Arts Organizations"],

    required_modules=["contacts", "activities", "donations"],
    suggested_modules=["grants", "organizations", "events"],
    optional_modules=["service_requests"],

    setup_questions=[
        {
            "question": "How do you categorize your donors?",
            "module": "donations",
            "field": "donor_segments",
            "type": "multi_choice_custom",
            "default": ["Prospect", "New Donor", "Regular Donor", "Major Donor", "Lapsed"]
        },
        {
            "question": "Do you apply for grants?",
            "type": "boolean",
            "if_yes": ["Enable grants module"]
        },
        {
            "question": "Do you work with corporate partners?",
            "type": "boolean",
            "if_yes": ["Enable organizations module"]
        }
    ],

    estimated_setup_time="2-4 days",
    recommended_plan="small"
)


# ============================================================================
# MODULE REGISTRY
# ============================================================================

ALL_MODULES = {
    "contacts": CONTACTS_MODULE,
    "activities": ACTIVITIES_MODULE,
    "service_requests": SERVICE_REQUESTS_MODULE,
    "events": EVENT_MANAGEMENT_MODULE,
    "donations": DONATIONS_MODULE,
    "grants": GRANTS_MODULE,
    "organizations": ORGANIZATIONS_MODULE,
}

TEMPLATES = {
    "cbd": CBD_TEMPLATE,
    "nonprofit": NONPROFIT_TEMPLATE,
}


def get_template(template_id: str) -> Optional[OrganizationTemplate]:
    """Get template by ID"""
    return TEMPLATES.get(template_id)


def get_module(module_id: str) -> Optional[CRMModule]:
    """Get module by ID"""
    return ALL_MODULES.get(module_id)


def build_client_configuration(template_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build complete client configuration from template + answers
    This creates the exact specification needed to deploy their CRM
    """
    template = get_template(template_id)
    if not template:
        raise ValueError(f"Template {template_id} not found")

    config = {
        "template_id": template_id,
        "template_name": template.name,
        "modules": {},
        "entities": {},
        "workflows": {},
        "branding": {}
    }

    # Add required modules
    all_modules = template.required_modules + template.suggested_modules
    for module_id in all_modules:
        module = get_module(module_id)
        if module:
            config["modules"][module_id] = {
                "enabled": True,
                "configuration": {}
            }

            # Add module entities
            for entity_name, entity_def in module.base_entities.items():
                config["entities"][entity_name] = entity_def.copy()

    # Apply customizations from answers
    for question in template.setup_questions:
        question_id = question.get("question", "").lower().replace(" ", "_")
        if question_id in answers:
            answer = answers[question_id]

            if question.get("module") and question.get("field"):
                module_id = question["module"]
                field_name = question["field"]

                if module_id in config["modules"]:
                    config["modules"][module_id]["configuration"][field_name] = answer

    return config