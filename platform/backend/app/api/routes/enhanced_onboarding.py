"""
Enhanced AI Onboarding API Routes
Handles hybrid manual + AI analysis workflow
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import json

from ...core.database import get_database
from ...core.auth import get_current_platform_user
from ...services.hybrid_ai_onboarding import HybridAIOnboardingService, EnhancedOnboardingWorkflow
from ...services.makelit_integration import create_makelit_crm_from_intake


router = APIRouter()


class EnhancedOnboardingRequest(BaseModel):
    org_name: str
    website_url: str
    contact_email: str
    contact_name: str
    website_content: str
    form_990_data: str
    analysis_type: str = "detailed"
    plan: str = "medium"
    data_files_info: Optional[str] = None  # Description of data files instead of actual files


class AIAnalysisPromptResponse(BaseModel):
    client_id: str
    organization_analysis_prompt: str
    crm_configuration_prompt: Optional[str] = None
    uploaded_files_summary: Dict[str, Any]
    status: str
    next_steps: List[str]


@router.post("/enhanced-onboarding-json", response_model=AIAnalysisPromptResponse)
async def start_enhanced_onboarding_json(
    request: EnhancedOnboardingRequest
) -> AIAnalysisPromptResponse:
    """
    Start the enhanced onboarding process with AI analysis (JSON only)
    """

    try:
        # Create mock files info from description
        files_info = []
        if request.data_files_info:
            # Parse the description into mock file entries
            descriptions = request.data_files_info.split(',')
            for desc in descriptions:
                desc = desc.strip()
                if desc:
                    files_info.append({
                        "filename": f"{desc.replace(' ', '_')}.csv",
                        "size": 5000,  # Mock size
                        "content_type": "text/csv",
                        "row_count": 100,  # Mock row count
                        "description": desc
                    })

        # Initialize enhanced workflow
        workflow = EnhancedOnboardingWorkflow()

        # Start enhanced onboarding
        result = await workflow.start_enhanced_onboarding(
            basic_info={
                "org_name": request.org_name,
                "website_url": request.website_url,
                "contact_email": request.contact_email,
                "contact_name": request.contact_name,
                "plan": request.plan,
                "analysis_type": request.analysis_type
            },
            website_content=request.website_content,
            form_990_data=request.form_990_data,
            uploaded_files=files_info
        )

        return AIAnalysisPromptResponse(
            client_id=result["client_id"],
            organization_analysis_prompt=result["analysis_prompts"]["step_1_analysis_prompt"],
            crm_configuration_prompt=None,  # Generated after step 1
            uploaded_files_summary=result["analysis_prompts"]["data_summary"],
            status="ready_for_ai_analysis",
            next_steps=[
                "Run the organization analysis prompt through Claude",
                "Complete the structured analysis form",
                "Submit analysis results to generate CRM configuration",
                "Review and approve final CRM setup",
                "Deploy customized CRM within 1 week"
            ]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting enhanced onboarding: {str(e)}"
        )


@router.post("/enhanced-onboarding", response_model=AIAnalysisPromptResponse)
async def start_enhanced_onboarding(
    request: EnhancedOnboardingRequest,
    uploaded_files: Optional[List[UploadFile]] = File(None),
    current_user: Optional[Dict[str, Any]] = None,  # Temporarily disable auth for testing
    db: AsyncSession = Depends(get_database)
) -> AIAnalysisPromptResponse:
    """
    Start the enhanced onboarding process with AI analysis (with file uploads)
    """

    try:
        # Process uploaded files
        files_info = []
        if uploaded_files:
            for file in uploaded_files:
                content = await file.read()

                # For CSV files, try to get row count
                row_count = 0
                if file.filename.endswith('.csv'):
                    try:
                        import pandas as pd
                        import io
                        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
                        row_count = len(df)
                    except:
                        row_count = 0

                files_info.append({
                    "filename": file.filename,
                    "size": len(content),
                    "content_type": file.content_type,
                    "row_count": row_count
                })

        # Initialize enhanced workflow
        workflow = EnhancedOnboardingWorkflow()

        # Start enhanced onboarding
        result = await workflow.start_enhanced_onboarding(
            basic_info={
                "org_name": request.org_name,
                "website_url": request.website_url,
                "contact_email": request.contact_email,
                "contact_name": request.contact_name,
                "plan": request.plan,
                "analysis_type": request.analysis_type
            },
            website_content=request.website_content,
            form_990_data=request.form_990_data,
            uploaded_files=files_info
        )

        return AIAnalysisPromptResponse(
            client_id=result["client_id"],
            organization_analysis_prompt=result["analysis_prompts"]["step_1_analysis_prompt"],
            crm_configuration_prompt=None,  # Generated after step 1
            uploaded_files_summary=result["analysis_prompts"]["data_summary"],
            status="ready_for_ai_analysis",
            next_steps=[
                "Run the organization analysis prompt through Claude",
                "Complete the structured analysis form",
                "Submit analysis results to generate CRM configuration",
                "Review and approve final CRM setup",
                "Deploy customized CRM within 1 week"
            ]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting enhanced onboarding: {str(e)}"
        )


@router.post("/generate-crm-config")
async def generate_crm_configuration(
    client_id: str = Form(...),
    analysis_results: str = Form(...),  # JSON string of completed analysis
    current_user: Dict[str, Any] = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """
    Generate CRM configuration prompt based on completed analysis
    """

    try:
        # Parse analysis results
        analysis_data = json.loads(analysis_results)

        # Initialize service
        service = HybridAIOnboardingService()

        # Get uploaded files info (would be stored from previous step)
        # For now, using placeholder
        uploaded_data_info = {
            "files": ["contacts.csv", "donations.xlsx"],
            "estimated_records": 1500
        }

        # Generate CRM configuration prompt
        crm_prompt = await service.generate_crm_config_from_analysis(
            analysis_data, uploaded_data_info
        )

        return {
            "client_id": client_id,
            "crm_configuration_prompt": crm_prompt,
            "analysis_summary": analysis_data,
            "status": "ready_for_crm_configuration",
            "next_steps": [
                "Run the CRM configuration prompt through Claude",
                "Review recommended modules and customization",
                "Approve configuration or request modifications",
                "Deploy CRM with approved configuration"
            ]
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis results format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating CRM configuration: {str(e)}"
        )


@router.post("/deploy-configured-crm")
async def deploy_configured_crm(
    client_id: str = Form(...),
    crm_configuration: str = Form(...)  # JSON string of approved config
) -> Dict[str, Any]:
    """
    Deploy CRM with approved configuration
    """

    try:
        # Parse configuration
        config_data = json.loads(crm_configuration)

        # This would integrate with the existing CRM generation system
        # For now, return success response
        return {
            "client_id": client_id,
            "status": "crm_deployed",
            "crm_url": f"https://{client_id}.crmblr.com",
            "admin_credentials": {
                "email": "admin@example.org",
                "temp_password": "TempPass123!"
            },
            "configuration_applied": config_data.get("modules", []),
            "data_import_status": "in_progress",
            "estimated_completion": "Within 24 hours"
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid configuration format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deploying CRM: {str(e)}"
        )


@router.post("/create-makelit-crm", response_model=Dict[str, Any])
async def create_makelit_crm(
    request: EnhancedOnboardingRequest
) -> Dict[str, Any]:
    """
    Create and deploy Make-Lit CRM directly from enhanced onboarding data
    """
    try:
        # Convert request to Make-Lit intake format
        intake_data_dict = {
            "org_name": request.org_name,
            "website_url": request.website_url,
            "contact_email": request.contact_email,
            "contact_name": request.contact_name,
            "website_content": request.website_content,
            "form_990_data": request.form_990_data,
            "data_files_info": request.data_files_info,
            "analysis_type": request.analysis_type,
            "plan": request.plan
        }

        # Create Make-Lit CRM using integration service
        result = await create_makelit_crm_from_intake(intake_data_dict)

        return {
            "success": result["success"],
            "client_id": result["client_id"],
            "crm_url": result.get("crm_url"),
            "admin_credentials": result.get("admin_credentials"),
            "configuration": result.get("configuration"),
            "analysis_summary": result.get("analysis_summary"),
            "deployment_status": result.get("deployment_status"),
            "error": result.get("error"),
            "message": "Make-Lit CRM created successfully" if result["success"] else f"Error: {result.get('error')}"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "client_id": f"makelit_{request.org_name.lower().replace(' ', '_')}",
            "deployment_status": "failed",
            "message": f"Failed to create Make-Lit CRM: {str(e)}"
        }


@router.get("/onboarding/{client_id}/status")
async def get_onboarding_status(
    client_id: str,
    current_user: Dict[str, Any] = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """
    Get status of enhanced onboarding process
    """

    # This would query the database for actual status
    # For now, return mock status
    return {
        "client_id": client_id,
        "current_step": "ai_analysis_complete",
        "progress_percentage": 60,
        "steps_completed": [
            "data_collection",
            "ai_analysis",
            "configuration_generation"
        ],
        "next_step": "crm_deployment",
        "estimated_completion": "2024-09-20T18:00:00Z",
        "last_updated": "2024-09-16T14:30:00Z"
    }