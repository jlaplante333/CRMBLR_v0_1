"""
Flexible Template System for CRMBLR Platform
Allows easy customization and addition of fields for each client's unique needs
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from enum import Enum


class BaseTemplate(BaseModel):
    """Base template that can be easily customized per client"""
    name: str
    description: str

    # Core entities that most organizations need
    core_entities: List[str] = ["contacts", "activities", "notes"]

    # Suggested additional entities based on org type
    suggested_entities: List[str] = []

    # Base field sets that can be extended
    base_field_sets: Dict[str, List[Dict]] = {}

    # Customization questions to ask during setup
    customization_questions: List[Dict] = []


class CommunityBenefitDistrictTemplate(BaseTemplate):
    """Starting template for CBDs - easily customizable"""

    def __init__(self):
        super().__init__(
            name="Community Benefit District",
            description="Starting point for CBDs - fully customizable to your specific operations",

            core_entities=["contacts", "service_requests", "events"],

            suggested_entities=[
                "projects", "vendors", "reports", "meetings",
                "budget_items", "board_resolutions"
            ],

            base_field_sets={
                "contacts": [
                    {"name": "first_name", "type": "string", "required": True},
                    {"name": "last_name", "type": "string", "required": True},
                    {"name": "email", "type": "email"},
                    {"name": "phone", "type": "phone"},
                    {"name": "organization", "type": "string"},
                    {"name": "role", "type": "string"},
                    {"name": "address", "type": "address"},
                ],

                "service_requests": [
                    {"name": "location", "type": "string", "required": True},
                    {"name": "description", "type": "text", "required": True},
                    {"name": "priority", "type": "choice", "choices": ["Low", "Medium", "High", "Urgent"]},
                    {"name": "status", "type": "choice", "choices": ["New", "In Progress", "Completed"]},
                    {"name": "assigned_to", "type": "string"},
                ],

                "events": [
                    {"name": "title", "type": "string", "required": True},
                    {"name": "date", "type": "datetime", "required": True},
                    {"name": "location", "type": "string"},
                    {"name": "description", "type": "text"},
                ],
            },

            customization_questions=[
                {
                    "id": "service_types",
                    "question": "What types of service requests do you handle?",
                    "type": "multi_choice_custom",
                    "suggestions": ["Trash Pickup", "Graffiti Removal", "Safety Issues", "Landscaping", "Street Cleaning"],
                    "applies_to": "service_requests.request_type"
                },
                {
                    "id": "contact_types",
                    "question": "What types of contacts do you work with?",
                    "type": "multi_choice_custom",
                    "suggestions": ["Property Owner", "Business Owner", "Ambassador", "Board Member", "City Official"],
                    "applies_to": "contacts.contact_type"
                },
                {
                    "id": "priority_levels",
                    "question": "How do you prioritize service requests?",
                    "type": "multi_choice_custom",
                    "suggestions": ["Routine", "High", "Urgent", "Hazardous"],
                    "applies_to": "service_requests.priority"
                },
                {
                    "id": "tracking_fields",
                    "question": "What additional information do you need to track?",
                    "type": "custom_fields",
                    "suggestions": [
                        {"name": "weight_collected", "type": "decimal", "label": "Weight Collected (lbs)"},
                        {"name": "time_to_complete", "type": "integer", "label": "Time to Complete (minutes)"},
                        {"name": "cost", "type": "decimal", "label": "Cost"},
                        {"name": "cross_street", "type": "string", "label": "Cross Street"},
                        {"name": "crew_type", "type": "string", "label": "Crew Type"},
                    ]
                },
                {
                    "id": "additional_entities",
                    "question": "Do you need to track any of these additional items?",
                    "type": "multi_choice",
                    "choices": [
                        {"id": "vendors", "label": "Vendors/Contractors"},
                        {"id": "budget_items", "label": "Budget Items"},
                        {"id": "permits", "label": "Permits/Licenses"},
                        {"id": "projects", "label": "Projects/Initiatives"},
                        {"id": "reports", "label": "Reports/Documentation"},
                        {"id": "meetings", "label": "Meetings/Minutes"},
                    ]
                }
            ]
        )


class NonprofitTemplate(BaseTemplate):
    """Starting template for nonprofits - easily customizable"""

    def __init__(self):
        super().__init__(
            name="Nonprofit Organization",
            description="Starting point for nonprofits - fully customizable to your mission",

            core_entities=["contacts", "donations", "activities"],

            suggested_entities=[
                "grants", "volunteers", "programs", "events",
                "campaigns", "board_meetings"
            ],

            base_field_sets={
                "contacts": [
                    {"name": "first_name", "type": "string", "required": True},
                    {"name": "last_name", "type": "string", "required": True},
                    {"name": "email", "type": "email"},
                    {"name": "phone", "type": "phone"},
                    {"name": "donor_status", "type": "choice", "choices": ["Prospect", "Donor", "Major Donor", "Lapsed"]},
                ],

                "donations": [
                    {"name": "amount", "type": "decimal", "required": True},
                    {"name": "date", "type": "date", "required": True},
                    {"name": "campaign", "type": "string"},
                    {"name": "method", "type": "choice", "choices": ["Cash", "Check", "Credit Card", "Online"]},
                ],
            },

            customization_questions=[
                {
                    "id": "donor_categories",
                    "question": "How do you categorize your donors?",
                    "type": "multi_choice_custom",
                    "suggestions": ["Individual", "Corporate", "Foundation", "Government", "Board Member"],
                    "applies_to": "contacts.donor_type"
                },
                {
                    "id": "program_tracking",
                    "question": "What programs do you need to track?",
                    "type": "custom_entities",
                    "description": "We can create custom tracking for each of your programs"
                },
                {
                    "id": "volunteer_needs",
                    "question": "Do you work with volunteers?",
                    "type": "boolean_with_fields",
                    "if_yes_fields": [
                        {"name": "skills", "type": "multi_choice", "label": "Volunteer Skills"},
                        {"name": "availability", "type": "string", "label": "Availability"},
                        {"name": "hours_committed", "type": "integer", "label": "Hours Committed"},
                    ]
                }
            ]
        )


class TemplateCustomizer:
    """Handles customization of templates based on client needs"""

    @staticmethod
    def apply_customizations(template: BaseTemplate, answers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply customer answers to create a fully customized configuration
        """
        config = {
            "template_name": template.name,
            "entities": {},
            "workflows": {},
            "branding": {}
        }

        # Start with base field sets
        for entity_name, base_fields in template.base_field_sets.items():
            config["entities"][entity_name] = {
                "fields": base_fields.copy(),
                "workflows": [],
                "custom_fields": []
            }

        # Apply customizations based on answers
        for question in template.customization_questions:
            question_id = question["id"]
            if question_id in answers:
                answer = answers[question_id]
                config = TemplateCustomizer._apply_answer(config, question, answer)

        return config

    @staticmethod
    def _apply_answer(config: Dict, question: Dict, answer: Any) -> Dict:
        """Apply a specific answer to the configuration"""

        if question["type"] == "multi_choice_custom" and "applies_to" in question:
            # Add custom choices to a field
            entity_field = question["applies_to"].split(".")
            entity = entity_field[0]
            field_name = entity_field[1]

            if entity in config["entities"]:
                # Find the field and update its choices
                for field in config["entities"][entity]["fields"]:
                    if field["name"] == field_name:
                        field["choices"] = answer
                        break
                else:
                    # Add the field if it doesn't exist
                    config["entities"][entity]["fields"].append({
                        "name": field_name,
                        "type": "choice",
                        "choices": answer
                    })

        elif question["type"] == "custom_fields":
            # Add custom fields to an entity
            entity = question.get("entity", "service_requests")  # default
            if entity in config["entities"]:
                config["entities"][entity]["custom_fields"].extend(answer)

        elif question["type"] == "multi_choice":
            # Add additional entities
            for choice in answer:
                entity_id = choice["id"]
                config["entities"][entity_id] = {
                    "name": choice["label"],
                    "fields": [
                        {"name": "name", "type": "string", "required": True},
                        {"name": "description", "type": "text"},
                        {"name": "date", "type": "date"},
                    ],
                    "workflows": [],
                    "custom_fields": []
                }

        return config


# Available templates
AVAILABLE_TEMPLATES = {
    "cbd": CommunityBenefitDistrictTemplate(),
    "nonprofit": NonprofitTemplate(),
}


def get_template(template_id: str) -> Optional[BaseTemplate]:
    """Get template by ID"""
    return AVAILABLE_TEMPLATES.get(template_id)


def create_client_configuration(template_id: str, customization_answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a complete client configuration from template + customizations
    """
    template = get_template(template_id)
    if not template:
        raise ValueError(f"Template {template_id} not found")

    return TemplateCustomizer.apply_customizations(template, customization_answers)


# Example usage for SOMA West
SOMA_WEST_CUSTOMIZATION = {
    "service_types": ["Trash Pickup", "Sweeping", "Hazardous Material", "Graffiti Removal", "Landscaping", "Safety Issue"],
    "contact_types": ["Property Owner", "Business Owner", "Resident", "City Official", "Board Member", "Ambassador", "Cleaning Crew"],
    "priority_levels": ["Routine", "High", "Urgent", "Hazardous"],
    "tracking_fields": [
        {"name": "weight_collected", "type": "decimal", "label": "Weight Collected (lbs)"},
        {"name": "time_to_complete", "type": "integer", "label": "Time to Complete (minutes)"},
        {"name": "cross_street", "type": "string", "label": "Cross Street"},
        {"name": "crew_type", "type": "string", "label": "Crew Type"},
    ],
    "additional_entities": [
        {"id": "projects", "label": "Projects/Initiatives"},
        {"id": "reports", "label": "Reports/Documentation"},
    ]
}