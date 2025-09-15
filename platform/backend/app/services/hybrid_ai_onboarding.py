"""
Hybrid AI Onboarding Service
Manual data collection + AI analysis + automated CRM generation
Perfect bridge between MVP and full automation
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from pydantic import BaseModel


class OrganizationAnalysisForm(BaseModel):
    """Structured form for AI to complete based on website/990 analysis"""

    # Organization Basics
    organization_name: str
    mission_statement: str
    founded_year: Optional[int]
    annual_budget: Optional[float]
    staff_count: Optional[int]
    volunteer_count: Optional[int]

    # Programs & Services
    primary_programs: List[str]  # Main service offerings
    service_delivery_model: str  # "direct", "advocacy", "grantmaking", "hybrid"
    target_beneficiaries: str  # Who they serve
    geographic_scope: str  # "local", "regional", "national", "international"

    # Fundraising & Revenue
    revenue_sources: Dict[str, float]  # {"donations": 60, "grants": 30, "fees": 10}
    donor_segments: List[str]  # ["major_gifts", "recurring", "events", "foundations"]
    fundraising_events: List[str]  # Types of events they run
    grant_funding: bool  # Do they receive grants?

    # Stakeholder Management
    has_volunteers: bool
    volunteer_programs: List[str]  # Types of volunteer opportunities
    has_board: bool
    board_size: Optional[int]
    has_committees: bool

    # Operations & Engagement
    runs_events: bool
    event_types: List[str]  # ["fundraising", "program", "community", "educational"]
    has_membership: bool
    membership_tiers: List[str]
    tracks_outcomes: bool

    # Communication & Outreach
    communication_channels: List[str]  # ["email", "social", "newsletter", "website"]
    social_media_presence: bool
    newsletter_frequency: Optional[str]

    # Data & Technology Needs
    current_systems: List[str]  # What they use now
    integration_needs: List[str]  # External systems to connect
    reporting_requirements: List[str]  # What reports they need
    compliance_tracking: List[str]  # Regulatory requirements


@dataclass
class CRMRecommendation:
    """AI-generated CRM configuration recommendation"""

    # Core Modules
    recommended_modules: List[str]
    module_rationale: Dict[str, str]  # Why each module is recommended

    # Custom Configuration
    custom_fields: Dict[str, List[Dict]]  # Per module
    custom_workflows: List[Dict]
    custom_reports: List[Dict]

    # Data Structure
    entity_relationships: Dict[str, List[str]]
    data_import_strategy: Dict[str, str]

    # Implementation Details
    setup_complexity: str  # "simple", "moderate", "complex"
    estimated_setup_time: str  # "24 hours", "48 hours", "1 week"
    recommended_plan: str  # "small", "medium", "large"

    # Confidence & Review
    confidence_score: float  # 0.0 to 1.0
    requires_review: List[str]  # Items needing human verification
    alternative_configs: List[Dict]  # Other viable options


class HybridAIOnboardingService:
    """
    Enhanced onboarding combining manual input with AI analysis
    """

    def generate_analysis_prompt(self, website_content: str, form_990_data: str) -> str:
        """
        Generate comprehensive prompt for AI analysis
        """
        return f"""
        Analyze this nonprofit organization and complete the structured form below.

        WEBSITE CONTENT:
        {website_content}

        IRS FORM 990 DATA:
        {form_990_data}

        Please complete this analysis form with accurate information extracted from the provided data:

        ORGANIZATION ANALYSIS FORM:

        **Organization Basics:**
        - Organization Name: [Extract from documents]
        - Mission Statement: [Summarize in 1-2 sentences]
        - Founded Year: [If available]
        - Annual Budget: [From 990 total revenue]
        - Staff Count: [From 990 if available]
        - Volunteer Count: [From website/990]

        **Programs & Services:**
        - Primary Programs: [List 3-5 main programs/services]
        - Service Delivery Model: [direct/advocacy/grantmaking/hybrid]
        - Target Beneficiaries: [Who do they serve?]
        - Geographic Scope: [local/regional/national/international]

        **Fundraising & Revenue:**
        - Revenue Sources: [Percentage breakdown from 990]
        - Donor Segments: [Types of donors mentioned]
        - Fundraising Events: [Events listed on website]
        - Grant Funding: [Yes/No based on 990]

        **Stakeholder Management:**
        - Has Volunteers: [Yes/No]
        - Volunteer Programs: [Types of volunteer opportunities]
        - Has Board: [Yes/No]
        - Board Size: [Number from 990]
        - Has Committees: [Yes/No if mentioned]

        **Operations & Engagement:**
        - Runs Events: [Yes/No]
        - Event Types: [fundraising/program/community/educational]
        - Has Membership: [Yes/No]
        - Membership Tiers: [If applicable]
        - Tracks Outcomes: [Yes/No if impact metrics mentioned]

        **Communication & Outreach:**
        - Communication Channels: [email/social/newsletter/website]
        - Social Media Presence: [Yes/No]
        - Newsletter Frequency: [If mentioned]

        **Data & Technology Needs:**
        - Current Systems: [Any mentioned systems]
        - Integration Needs: [External systems mentioned]
        - Reporting Requirements: [Reports they likely need]
        - Compliance Tracking: [Regulatory requirements]

        ANALYSIS INSTRUCTIONS:
        1. Extract factual information where available
        2. Make reasonable inferences based on organization type/size
        3. Note assumptions clearly
        4. Flag any areas needing clarification

        Format your response as a structured analysis that can be used to configure their CRM system.
        """

    def generate_crm_recommendation_prompt(self, analysis_form: Dict[str, Any], uploaded_data_info: Dict[str, Any]) -> str:
        """
        Generate prompt for CRM configuration recommendations
        """
        return f"""
        Based on this nonprofit analysis and their uploaded data, recommend an optimal CRM configuration.

        ORGANIZATION ANALYSIS:
        {analysis_form}

        UPLOADED DATA PREVIEW:
        {uploaded_data_info}

        Generate a comprehensive CRM recommendation including:

        **1. CORE MODULES (select from: contacts, donations, volunteers, events, grants, services, programs)**
        For each recommended module, explain:
        - Why it's needed for this organization
        - How it addresses their specific use case
        - Priority level (essential/important/optional)

        **2. CUSTOM CONFIGURATION**

        Custom Fields Needed:
        - Contacts: [additional fields beyond standard name/email/phone]
        - Donations: [custom fields for their fundraising model]
        - Events: [fields specific to their event types]
        - [Other modules as applicable]

        Custom Workflows:
        - Donor acknowledgment process
        - Volunteer onboarding
        - Event registration handling
        - [Other automation opportunities]

        Custom Reports:
        - Financial dashboards for their revenue model
        - Program impact tracking
        - Compliance reporting needs
        - [Organization-specific reports]

        **3. DATA IMPORT STRATEGY**
        Based on their uploaded files:
        - Which files map to which modules
        - Field mapping recommendations
        - Data cleaning requirements
        - Potential duplicate handling

        **4. IMPLEMENTATION PLAN**
        - Setup complexity assessment
        - Estimated timeline
        - Recommended pricing tier
        - Phased rollout if complex

        **5. CONFIDENCE & REVIEW**
        - Overall confidence score (0-100%)
        - Items requiring human review
        - Alternative configurations to consider
        - Risks or concerns

        Prioritize practical, actionable recommendations that will deliver immediate value to this organization.
        """

    async def process_hybrid_onboarding(
        self,
        client_id: str,
        website_content: str,
        form_990_data: str,
        uploaded_files_info: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Process the hybrid onboarding workflow
        """

        # Step 1: Generate analysis prompts
        analysis_prompt = self.generate_analysis_prompt(website_content, form_990_data)

        # Step 2: Store prompts for manual AI processing
        analysis_request = {
            "client_id": client_id,
            "step": "organization_analysis",
            "prompt": analysis_prompt,
            "status": "pending_ai_analysis",
            "created_at": "now"
        }

        # Step 3: Prepare data summary for CRM recommendation
        data_summary = {
            "file_count": len(uploaded_files_info),
            "file_types": [f["filename"].split(".")[-1] for f in uploaded_files_info],
            "file_names": [f["filename"] for f in uploaded_files_info],
            "estimated_records": sum(f.get("row_count", 0) for f in uploaded_files_info)
        }

        return {
            "step_1_analysis_prompt": analysis_prompt,
            "step_2_crm_prompt": "Will be generated after Step 1 completion",
            "data_summary": data_summary,
            "next_action": "Run Step 1 prompt through Claude, then proceed to Step 2",
            "client_id": client_id
        }

    async def generate_crm_config_from_analysis(
        self,
        organization_analysis: Dict[str, Any],
        uploaded_data_info: Dict[str, Any]
    ) -> str:
        """
        Generate the CRM configuration prompt after analysis is complete
        """
        return self.generate_crm_recommendation_prompt(organization_analysis, uploaded_data_info)


# Integration with existing MVP system
class EnhancedOnboardingWorkflow:
    """
    Enhanced workflow that integrates hybrid AI approach with existing MVP
    """

    def __init__(self):
        self.hybrid_service = HybridAIOnboardingService()

    async def start_enhanced_onboarding(
        self,
        basic_info: Dict[str, Any],
        website_content: str,
        form_990_data: str,
        uploaded_files: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Start the enhanced onboarding process
        """

        # Create client record
        client_id = f"client_{basic_info['org_name'].lower().replace(' ', '_')}"

        # Process hybrid analysis
        analysis_result = await self.hybrid_service.process_hybrid_onboarding(
            client_id=client_id,
            website_content=website_content,
            form_990_data=form_990_data,
            uploaded_files_info=uploaded_files
        )

        return {
            "client_id": client_id,
            "onboarding_method": "hybrid_ai_enhanced",
            "basic_info": basic_info,
            "analysis_prompts": analysis_result,
            "status": "ready_for_ai_analysis",
            "timeline": "Complete AI analysis → Generate CRM config → Deploy within 1 week"
        }


"""
USAGE WORKFLOW:

1. Customer fills basic form + uploads files
2. You manually provide website content and 990 data
3. System generates comprehensive AI analysis prompts
4. You run prompts through Claude
5. Claude completes organization analysis form
6. System generates CRM configuration recommendations
7. You review and approve configuration
8. System automatically deploys customized CRM
9. Data is imported with AI-recommended mappings

TIMELINE: 1 week from data collection to deployment
EFFORT: ~2 hours of manual work per client
RESULT: Highly customized CRM optimized for each nonprofit
"""