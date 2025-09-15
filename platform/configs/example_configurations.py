"""
Example client configurations using the ultra-flexible template system
These demonstrate how different organizations get exactly what they need
"""

from ..backend.app.models.ultra_flexible_templates import build_client_configuration


# ============================================================================
# EXAMPLE 1: SOMA West CBD (Actual Client)
# ============================================================================

SOMA_WEST_ANSWERS = {
    "what_types_of_service_requests_do_you_handle": [
        "Trash Pickup", "Sweeping", "Hazardous Material",
        "Graffiti Removal", "Landscaping", "Safety Issue"
    ],
    "how_do_you_prioritize_requests": [
        "Routine", "High", "Urgent", "Hazardous"
    ],
    "what_information_do_you_track_for_each_request": [
        "weight_collected", "time_to_complete", "crew_type", "cross_street"
    ],
    "what_types_of_contacts_do_you_work_with": [
        "Property Owner", "Business Owner", "Resident", "City Official",
        "Board Member", "Ambassador", "Cleaning Crew", "Vendor/Contractor"
    ],
    "what_types_of_events_do_you_organize": [
        "Community Events", "Meetings", "Cleanup Days", "Street Activation"
    ]
}

soma_west_config = build_client_configuration("cbd", SOMA_WEST_ANSWERS)


# ============================================================================
# EXAMPLE 2: Arts Nonprofit (Different Focus)
# ============================================================================

ARTS_NONPROFIT_ANSWERS = {
    "how_do_you_categorize_your_donors": [
        "Patron", "Member", "Corporate Sponsor", "Foundation", "Board Member"
    ],
    "do_you_apply_for_grants": True,
    "do_you_work_with_corporate_partners": True,
    "what_types_of_events_do_you_organize": [
        "Performances", "Exhibitions", "Fundraisers", "Educational Programs", "Community Outreach"
    ],
    "what_types_of_contacts_do_you_work_with": [
        "Artist", "Patron", "Volunteer", "Board Member", "Staff",
        "Media Contact", "Venue Manager", "Vendor"
    ],
    "additional_modules_needed": ["events", "organizations"]
}

arts_nonprofit_config = build_client_configuration("nonprofit", ARTS_NONPROFIT_ANSWERS)


# ============================================================================
# EXAMPLE 3: Community Foundation (Grant-Making)
# ============================================================================

FOUNDATION_ANSWERS = {
    "primary_focus": "grant_making",
    "do_you_receive_donations": True,
    "do_you_make_grants": True,
    "do_you_work_with_corporate_partners": True,
    "what_types_of_organizations_do_you_fund": [
        "Nonprofit", "School", "Community Center", "Religious Organization", "Healthcare"
    ],
    "what_types_of_grants_do_you_make": [
        "Operating", "Program", "Capital", "Capacity Building", "Emergency"
    ],
    "what_types_of_contacts_do_you_work_with": [
        "Grant Applicant", "Board Member", "Donor", "Community Leader",
        "Nonprofit Executive", "Program Officer"
    ]
}

# Foundation would use nonprofit template but with heavy emphasis on grants + organizations
foundation_config = build_client_configuration("nonprofit", FOUNDATION_ANSWERS)


# ============================================================================
# EXAMPLE 4: Property Management Company (Service-Focused)
# ============================================================================

PROPERTY_MGMT_ANSWERS = {
    "what_types_of_service_requests_do_you_handle": [
        "Maintenance", "Repair", "Inspection", "Cleaning", "Security Issue", "Tenant Complaint"
    ],
    "how_do_you_prioritize_requests": [
        "Routine", "Urgent", "Emergency"
    ],
    "what_information_do_you_track_for_each_request": [
        "cost", "time_to_complete", "before_photo", "after_photo", "vendor_used"
    ],
    "what_types_of_contacts_do_you_work_with": [
        "Tenant", "Property Owner", "Vendor", "Contractor", "City Inspector", "Staff"
    ],
    "what_types_of_events_do_you_organize": [
        "Property Inspections", "Tenant Meetings", "Maintenance Windows"
    ]
}

property_mgmt_config = build_client_configuration("cbd", PROPERTY_MGMT_ANSWERS)


# ============================================================================
# EXAMPLE 5: Social Services Nonprofit (Complex Needs)
# ============================================================================

SOCIAL_SERVICES_ANSWERS = {
    "how_do_you_categorize_your_donors": [
        "Individual", "Corporate", "Foundation", "Government", "Faith-Based"
    ],
    "do_you_apply_for_grants": True,
    "do_you_work_with_corporate_partners": True,
    "what_types_of_service_requests_do_you_handle": [
        "Client Intake", "Case Management", "Resource Referral", "Crisis Response"
    ],
    "what_types_of_contacts_do_you_work_with": [
        "Client", "Donor", "Volunteer", "Board Member", "Staff",
        "Partner Organization", "Government Contact", "Vendor"
    ],
    "what_types_of_events_do_you_organize": [
        "Client Services", "Fundraisers", "Volunteer Training", "Community Education"
    ],
    "additional_modules_needed": ["service_requests", "events", "organizations", "grants"]
}

social_services_config = build_client_configuration("nonprofit", SOCIAL_SERVICES_ANSWERS)


# ============================================================================
# CONFIGURATION ANALYSIS
# ============================================================================

def analyze_configuration(config: dict, client_name: str):
    """Analyze what a configuration would create for a client"""

    print(f"\n=== {client_name.upper()} CONFIGURATION ===")
    print(f"Template: {config['template_name']}")
    print(f"Modules Enabled: {', '.join(config['modules'].keys())}")
    print(f"Entities Created: {', '.join(config['entities'].keys())}")

    # Complexity analysis
    module_count = len(config['modules'])
    if module_count <= 3:
        complexity = "Simple"
        recommended_plan = "Small ($500 setup + $500/month)"
    elif module_count <= 5:
        complexity = "Standard"
        recommended_plan = "Medium ($1000 setup + $1000/month)"
    else:
        complexity = "Complex"
        recommended_plan = "Unlimited ($2000 setup + $2000/month)"

    print(f"Complexity: {complexity}")
    print(f"Recommended Plan: {recommended_plan}")

    # Show some key customizations
    for module_id, module_config in config['modules'].items():
        if module_config.get('configuration'):
            print(f"  {module_id} customizations: {module_config['configuration']}")


if __name__ == "__main__":
    # Analyze all example configurations
    analyze_configuration(soma_west_config, "SOMA West CBD")
    analyze_configuration(arts_nonprofit_config, "Arts Nonprofit")
    analyze_configuration(foundation_config, "Community Foundation")
    analyze_configuration(property_mgmt_config, "Property Management")
    analyze_configuration(social_services_config, "Social Services")


# ============================================================================
# CONFIGURATION SUMMARY TABLE
# ============================================================================

CLIENT_EXAMPLES = [
    {
        "name": "SOMA West CBD",
        "type": "Community Benefit District",
        "modules": ["contacts", "service_requests", "events"],
        "plan": "Medium ($1000)",
        "setup_time": "3-5 days",
        "unique_features": ["Weight tracking", "Crew assignment", "Cross-street mapping"]
    },
    {
        "name": "Arts Nonprofit",
        "type": "Cultural Organization",
        "modules": ["contacts", "donations", "grants", "events", "organizations"],
        "plan": "Unlimited ($2000)",
        "setup_time": "4-6 days",
        "unique_features": ["Patron management", "Performance tracking", "Artist database"]
    },
    {
        "name": "Property Management",
        "type": "Service Company",
        "modules": ["contacts", "service_requests", "events"],
        "plan": "Medium ($1000)",
        "setup_time": "2-4 days",
        "unique_features": ["Cost tracking", "Photo documentation", "Vendor management"]
    },
    {
        "name": "Social Services",
        "type": "Human Services Nonprofit",
        "modules": ["contacts", "donations", "grants", "service_requests", "events", "organizations"],
        "plan": "Unlimited ($2000)",
        "setup_time": "5-7 days",
        "unique_features": ["Client case management", "Resource referrals", "Crisis response"]
    }
]

print("\n" + "="*80)
print("CLIENT CONFIGURATION EXAMPLES")
print("="*80)
print(f"{'Client':<20} {'Type':<25} {'Modules':<15} {'Plan':<20} {'Setup':<12}")
print("-" * 80)

for client in CLIENT_EXAMPLES:
    print(f"{client['name']:<20} {client['type']:<25} {len(client['modules']):<15} {client['plan']:<20} {client['setup_time']:<12}")

print("\n💡 Key Insight: Same platform, completely different CRMs for each client's needs!")