"""
Data Processing API Routes
Handles file uploads, data analysis, and CRM generation
"""

import os
import pandas as pd
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from pydantic import BaseModel

from ...core.database import get_database
from ...core.auth import get_current_platform_user, get_current_client_user
from ...models.platform import Client, ClientProject
from ...services.basic_data_importer import BasicDataImporter, import_csv_for_client
from ...services.basic_crm_generator import BasicCRMGenerator, generate_basic_crm


router = APIRouter()


class FileUploadResponse(BaseModel):
    filename: str
    size: int
    content_type: str
    file_id: str


class DataAnalysisRequest(BaseModel):
    client_id: str
    uploaded_files: List[str]  # File IDs
    organization_type: Optional[str] = None  # Manual override


class DataAnalysisResponse(BaseModel):
    organization_type: str
    confidence: float
    suggested_modules: List[str]
    field_mappings: Dict[str, Any]
    data_preview: Dict[str, Any]
    analysis_id: str


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    client_id: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> FileUploadResponse:
    """Upload file for data processing"""

    # Validate client exists
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Validate file type
    allowed_types = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not supported. Please upload CSV or Excel files."
        )

    # Create uploads directory
    upload_dir = f"/tmp/crmblr_uploads/{client_id}"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_dir, file.filename)
    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    # Generate file ID (in production, store this in database)
    file_id = f"{client_id}_{file.filename}_{len(content)}"

    return FileUploadResponse(
        filename=file.filename,
        size=len(content),
        content_type=file.content_type,
        file_id=file_id
    )


@router.post("/analyze", response_model=DataAnalysisResponse)
async def analyze_data(
    request: DataAnalysisRequest,
    current_user: Dict[str, Any] = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> DataAnalysisResponse:
    """Analyze uploaded data and suggest CRM configuration"""

    # This is a simplified version for MVP
    # In production, this would use AI services to analyze the data

    try:
        # Load and preview data from uploaded files
        upload_dir = f"/tmp/crmblr_uploads/{request.client_id}"
        data_preview = {}
        suggested_modules = ["contacts"]  # Default
        organization_type = request.organization_type or "nonprofit"

        for file_id in request.uploaded_files:
            # Parse file_id to get filename
            parts = file_id.split("_")
            if len(parts) >= 2:
                filename = "_".join(parts[1:-1])  # Remove client_id and size
                file_path = os.path.join(upload_dir, filename)

                if os.path.exists(file_path):
                    try:
                        # Try to read as CSV first
                        if filename.endswith('.csv'):
                            df = pd.read_csv(file_path)
                        else:
                            # Try Excel
                            df = pd.read_excel(file_path)

                        # Basic analysis of the data
                        columns = df.columns.tolist()
                        sample_data = df.head(3).to_dict('records')

                        data_preview[filename] = {
                            "columns": columns,
                            "row_count": len(df),
                            "sample_data": sample_data
                        }

                        # Simple heuristics to suggest modules
                        column_names_lower = [col.lower() for col in columns]

                        if any(keyword in " ".join(column_names_lower)
                               for keyword in ["donation", "amount", "gift", "pledge"]):
                            if "donations" not in suggested_modules:
                                suggested_modules.append("donations")

                        if any(keyword in " ".join(column_names_lower)
                               for keyword in ["event", "program", "activity"]):
                            if "events" not in suggested_modules:
                                suggested_modules.append("events")

                        if any(keyword in " ".join(column_names_lower)
                               for keyword in ["volunteer", "hours", "service"]):
                            if "volunteers" not in suggested_modules:
                                suggested_modules.append("volunteers")

                    except Exception as e:
                        data_preview[filename] = {
                            "error": f"Could not parse file: {str(e)}",
                            "columns": [],
                            "row_count": 0,
                            "sample_data": []
                        }

        # Generate basic field mappings
        field_mappings = {
            "contacts": {
                "name_fields": ["name", "full_name", "first_name", "last_name"],
                "email_fields": ["email", "email_address", "e_mail"],
                "phone_fields": ["phone", "phone_number", "telephone"],
                "organization_fields": ["organization", "company", "org"]
            }
        }

        if "donations" in suggested_modules:
            field_mappings["donations"] = {
                "amount_fields": ["amount", "donation", "gift", "pledge_amount"],
                "date_fields": ["date", "donation_date", "gift_date"],
                "donor_fields": ["donor", "donor_name", "contributor"]
            }

        analysis_id = f"analysis_{request.client_id}_{len(request.uploaded_files)}"

        return DataAnalysisResponse(
            organization_type=organization_type,
            confidence=0.8,  # Mock confidence score
            suggested_modules=suggested_modules,
            field_mappings=field_mappings,
            data_preview=data_preview,
            analysis_id=analysis_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing data: {str(e)}"
        )


@router.post("/generate-crm")
async def generate_crm(
    client_data: str = Form(...),  # JSON string with client information
    selected_modules: List[str] = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Generate CRM based on onboarding data"""

    import json

    try:
        # Parse client data
        client_info = json.loads(client_data)

        # Use the basic CRM generator for MVP
        result = await generate_basic_crm(db, client_info, selected_modules)

        if result["success"]:
            return {
                "message": "CRM created successfully",
                "client_id": result["client_id"],
                "project_id": result["project_id"],
                "crm_url": result["crm_url"],
                "admin_email": result["admin_email"],
                "selected_modules": selected_modules,
                "status": "completed",
                "next_steps": [
                    "CRM is ready for use",
                    "Check your email for login details",
                    "Import your data using the data import tools",
                    "Customize your CRM settings"
                ]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"CRM generation failed: {result.get('error', 'Unknown error')}"
            )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client data format"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating CRM: {str(e)}"
        )


@router.get("/projects/{project_id}/status")
async def get_project_status(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Get CRM generation project status"""

    project_query = text("""
        SELECT p.id, p.name, p.description, p.status, p.progress_percentage,
               p.created_at, p.estimated_completion, p.actual_completion,
               c.name as client_name, c.subdomain
        FROM client_projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.id = :project_id
    """)

    result = await db.execute(project_query, {"project_id": project_id})
    project = result.first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return {
        "id": str(project[0]),
        "name": project[1],
        "description": project[2],
        "status": project[3],
        "progress_percentage": project[4],
        "created_at": project[5].isoformat() if project[5] else None,
        "estimated_completion": project[6].isoformat() if project[6] else None,
        "actual_completion": project[7].isoformat() if project[7] else None,
        "client_name": project[8],
        "subdomain": project[9],
        "crm_url": f"https://{project[9]}.crmblr.com" if project[9] and project[3] == "completed" else None
    }


@router.post("/import-csv")
async def import_csv_data(
    file: UploadFile = File(...),
    table_name: str = Form(...),
    field_mappings: str = Form(...),  # JSON string
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Import CSV data directly to client CRM (for existing clients)"""

    import json
    import tempfile

    client_id = current_user["client_id"]

    try:
        # Parse field mappings
        mappings = json.loads(field_mappings)

        # Read CSV file
        content = await file.read()

        # Save to temporary file
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            # Use the basic data importer
            result = await import_csv_for_client(db, client_id, temp_path, table_name, mappings)

            if result["success"]:
                return {
                    "message": f"Successfully imported {result['records_imported']} records to {table_name}",
                    "records_processed": result["records_processed"],
                    "records_imported": result["records_imported"],
                    "table_name": table_name,
                    "schema_name": result["schema_name"],
                    "columns_mapped": len(mappings)
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Import failed: {result.get('error', 'Unknown error')}"
                )

        finally:
            # Clean up temp file
            os.unlink(temp_path)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid field mappings JSON"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing CSV: {str(e)}"
        )


@router.post("/preview-csv")
async def preview_csv_import(
    file: UploadFile = File(...),
    table_name: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Preview CSV import before actually importing"""

    import tempfile

    try:
        # Read CSV file
        content = await file.read()

        # Save to temporary file
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            # Create importer instance
            importer = BasicDataImporter(db)

            # Auto-detect field mappings
            auto_mappings = importer.auto_detect_mappings(temp_path, table_name)

            # Get preview
            preview_result = await importer.preview_csv_import(temp_path, auto_mappings)

            if preview_result["success"]:
                return {
                    "success": True,
                    "file_info": {
                        "filename": file.filename,
                        "size": len(content),
                        "rows": preview_result["total_rows"]
                    },
                    "suggested_mappings": auto_mappings,
                    "preview_data": preview_result["preview_data"],
                    "column_mappings": preview_result["column_mappings"],
                    "available_fields": importer.get_default_field_mappings(table_name)
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Preview failed: {preview_result.get('error', 'Unknown error')}"
                )

        finally:
            # Clean up temp file
            os.unlink(temp_path)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error previewing CSV: {str(e)}"
        )