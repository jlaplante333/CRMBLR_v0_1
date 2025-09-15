"""
Client CRM API Routes
For client users to manage their CRM data
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from pydantic import BaseModel

from ...core.database import get_database, get_client_schema
from ...core.auth import get_current_client_user


router = APIRouter()


class ContactSearchRequest(BaseModel):
    query: str
    limit: int = 10


class ContactCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    notes: Optional[str] = None


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Get dashboard statistics for client CRM"""

    client_id = current_user["client_id"]
    schema_name = get_client_schema(client_id)

    try:
        # Get contact count
        contact_count_query = text(f"SELECT COUNT(*) FROM {schema_name}.contacts")
        contact_result = await db.execute(contact_count_query)
        total_contacts = contact_result.scalar()

        # Get recent activity count (last 30 days)
        recent_activity_query = text(f"""
            SELECT COUNT(*) FROM {schema_name}.contacts
            WHERE created_at >= NOW() - INTERVAL '30 days'
        """)
        recent_result = await db.execute(recent_activity_query)
        recent_contacts = recent_result.scalar()

        # Try to get donation stats if donations table exists
        donation_stats = {}
        try:
            donation_count_query = text(f"SELECT COUNT(*), SUM(amount) FROM {schema_name}.donations")
            donation_result = await db.execute(donation_count_query)
            donation_row = donation_result.first()
            if donation_row:
                donation_stats = {
                    "total_donations": donation_row[0] or 0,
                    "total_amount": float(donation_row[1]) if donation_row[1] else 0
                }
        except Exception:
            # Donations table might not exist for all clients
            donation_stats = {"total_donations": 0, "total_amount": 0}

        return {
            "contacts": {
                "total": total_contacts or 0,
                "recent": recent_contacts or 0
            },
            "donations": donation_stats,
            "client_id": client_id
        }

    except Exception as e:
        # If schema doesn't exist yet, return empty stats
        return {
            "contacts": {"total": 0, "recent": 0},
            "donations": {"total_donations": 0, "total_amount": 0},
            "client_id": client_id,
            "note": "CRM schema not yet initialized"
        }


@router.get("/contacts")
async def list_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """List contacts for client CRM"""

    client_id = current_user["client_id"]
    schema_name = get_client_schema(client_id)

    try:
        # Build query with optional search
        if search:
            contacts_query = text(f"""
                SELECT id, first_name, last_name, email, phone, organization, created_at
                FROM {schema_name}.contacts
                WHERE
                    LOWER(first_name) LIKE LOWER(:search) OR
                    LOWER(last_name) LIKE LOWER(:search) OR
                    LOWER(email) LIKE LOWER(:search) OR
                    LOWER(organization) LIKE LOWER(:search)
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :skip
            """)
            count_query = text(f"""
                SELECT COUNT(*) FROM {schema_name}.contacts
                WHERE
                    LOWER(first_name) LIKE LOWER(:search) OR
                    LOWER(last_name) LIKE LOWER(:search) OR
                    LOWER(email) LIKE LOWER(:search) OR
                    LOWER(organization) LIKE LOWER(:search)
            """)
            search_param = f"%{search}%"
            contacts_result = await db.execute(contacts_query, {"search": search_param, "limit": limit, "skip": skip})
            count_result = await db.execute(count_query, {"search": search_param})
        else:
            contacts_query = text(f"""
                SELECT id, first_name, last_name, email, phone, organization, created_at
                FROM {schema_name}.contacts
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :skip
            """)
            count_query = text(f"SELECT COUNT(*) FROM {schema_name}.contacts")
            contacts_result = await db.execute(contacts_query, {"limit": limit, "skip": skip})
            count_result = await db.execute(count_query)

        contacts = contacts_result.fetchall()
        total_count = count_result.scalar()

        contacts_data = []
        for contact in contacts:
            contacts_data.append({
                "id": str(contact[0]),
                "first_name": contact[1],
                "last_name": contact[2],
                "email": contact[3],
                "phone": contact[4],
                "organization": contact[5],
                "created_at": contact[6].isoformat() if contact[6] else None
            })

        return {
            "contacts": contacts_data,
            "total": total_count or 0,
            "skip": skip,
            "limit": limit,
            "search": search
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing client database: {str(e)}"
        )


@router.post("/contacts")
async def create_contact(
    contact: ContactCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Create new contact in client CRM"""

    client_id = current_user["client_id"]
    schema_name = get_client_schema(client_id)

    try:
        # Insert new contact
        insert_query = text(f"""
            INSERT INTO {schema_name}.contacts
            (id, first_name, last_name, email, phone, organization, notes, created_at, updated_at)
            VALUES (gen_random_uuid(), :first_name, :last_name, :email, :phone, :organization, :notes, NOW(), NOW())
            RETURNING id, first_name, last_name, email, phone, organization, created_at
        """)

        result = await db.execute(insert_query, {
            "first_name": contact.first_name,
            "last_name": contact.last_name,
            "email": contact.email,
            "phone": contact.phone,
            "organization": contact.organization,
            "notes": contact.notes
        })

        await db.commit()
        new_contact = result.first()

        return {
            "id": str(new_contact[0]),
            "first_name": new_contact[1],
            "last_name": new_contact[2],
            "email": new_contact[3],
            "phone": new_contact[4],
            "organization": new_contact[5],
            "created_at": new_contact[6].isoformat()
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating contact: {str(e)}"
        )


@router.get("/contacts/{contact_id}")
async def get_contact(
    contact_id: str,
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Get specific contact details"""

    client_id = current_user["client_id"]
    schema_name = get_client_schema(client_id)

    try:
        contact_query = text(f"""
            SELECT id, first_name, last_name, email, phone, organization, notes, created_at, updated_at
            FROM {schema_name}.contacts
            WHERE id = :contact_id
        """)

        result = await db.execute(contact_query, {"contact_id": contact_id})
        contact = result.first()

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found"
            )

        return {
            "id": str(contact[0]),
            "first_name": contact[1],
            "last_name": contact[2],
            "email": contact[3],
            "phone": contact[4],
            "organization": contact[5],
            "notes": contact[6],
            "created_at": contact[7].isoformat() if contact[7] else None,
            "updated_at": contact[8].isoformat() if contact[8] else None
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving contact: {str(e)}"
        )


@router.post("/search")
async def search_contacts(
    search_request: ContactSearchRequest,
    current_user: Dict[str, Any] = Depends(get_current_client_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Search contacts (for voice interface and general search)"""

    client_id = current_user["client_id"]
    schema_name = get_client_schema(client_id)

    try:
        search_query = text(f"""
            SELECT id, first_name, last_name, email, phone, organization
            FROM {schema_name}.contacts
            WHERE
                LOWER(first_name) LIKE LOWER(:search) OR
                LOWER(last_name) LIKE LOWER(:search) OR
                LOWER(email) LIKE LOWER(:search) OR
                LOWER(organization) LIKE LOWER(:search) OR
                LOWER(notes) LIKE LOWER(:search)
            ORDER BY
                CASE
                    WHEN LOWER(first_name) LIKE LOWER(:exact_search) OR LOWER(last_name) LIKE LOWER(:exact_search) THEN 1
                    WHEN LOWER(email) LIKE LOWER(:exact_search) THEN 2
                    ELSE 3
                END,
                created_at DESC
            LIMIT :limit
        """)

        search_param = f"%{search_request.query}%"
        exact_search_param = search_request.query.lower()

        result = await db.execute(search_query, {
            "search": search_param,
            "exact_search": exact_search_param,
            "limit": search_request.limit
        })

        contacts = result.fetchall()
        contacts_data = []

        for contact in contacts:
            contacts_data.append({
                "id": str(contact[0]),
                "first_name": contact[1],
                "last_name": contact[2],
                "email": contact[3],
                "phone": contact[4],
                "organization": contact[5],
                "full_name": f"{contact[1]} {contact[2]}"
            })

        return {
            "results": contacts_data,
            "query": search_request.query,
            "count": len(contacts_data)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching contacts: {str(e)}"
        )