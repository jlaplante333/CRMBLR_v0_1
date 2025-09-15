"""
Platform Management API Routes
For platform administrators to manage clients, monitor system, etc.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ...core.database import get_database
from ...core.auth import get_current_platform_user, get_current_superuser
from ...models.platform import Client, ClientUser, ClientProject


router = APIRouter()


@router.get("/clients")
async def list_clients(
    skip: int = 0,
    limit: int = 100,
    current_user: Dict = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """List all clients for platform administrators"""

    # Get clients with basic stats
    query = select(Client).offset(skip).limit(limit)
    result = await db.execute(query)
    clients = result.scalars().all()

    # Get total count
    count_query = select(func.count(Client.id))
    count_result = await db.execute(count_query)
    total_count = count_result.scalar()

    # Convert to dict format
    clients_data = []
    for client in clients:
        clients_data.append({
            "id": str(client.id),
            "name": client.name,
            "subdomain": client.subdomain,
            "organization_type": client.organization_type,
            "plan": client.plan,
            "status": client.status,
            "created_at": client.created_at.isoformat() if client.created_at else None,
            "last_active": client.last_active.isoformat() if client.last_active else None,
            "setup_fee_paid": client.setup_fee_paid,
            "primary_contact_email": client.primary_contact_email
        })

    return {
        "clients": clients_data,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }


@router.get("/clients/{client_id}")
async def get_client(
    client_id: str,
    current_user: Dict = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Get detailed client information"""

    # Get client
    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Get client users
    users_query = select(ClientUser).where(ClientUser.client_id == client_id)
    users_result = await db.execute(users_query)
    users = users_result.scalars().all()

    # Get client projects
    projects_query = select(ClientProject).where(ClientProject.client_id == client_id)
    projects_result = await db.execute(projects_query)
    projects = projects_result.scalars().all()

    return {
        "id": str(client.id),
        "name": client.name,
        "subdomain": client.subdomain,
        "domain": client.domain,
        "organization_type": client.organization_type,
        "template_id": client.template_id,
        "plan": client.plan,
        "status": client.status,
        "max_users": client.max_users,
        "stripe_customer_id": client.stripe_customer_id,
        "stripe_subscription_id": client.stripe_subscription_id,
        "setup_fee_paid": client.setup_fee_paid,
        "configuration": client.configuration,
        "branding": client.branding,
        "created_at": client.created_at.isoformat() if client.created_at else None,
        "updated_at": client.updated_at.isoformat() if client.updated_at else None,
        "last_active": client.last_active.isoformat() if client.last_active else None,
        "primary_contact_email": client.primary_contact_email,
        "primary_contact_name": client.primary_contact_name,
        "users": [
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
            for user in users
        ],
        "projects": [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "progress_percentage": project.progress_percentage,
                "created_at": project.created_at.isoformat() if project.created_at else None,
                "estimated_completion": project.estimated_completion.isoformat() if project.estimated_completion else None,
                "actual_completion": project.actual_completion.isoformat() if project.actual_completion else None
            }
            for project in projects
        ]
    }


@router.get("/stats")
async def platform_stats(
    current_user: Dict = Depends(get_current_platform_user),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Get platform statistics"""

    # Count clients by status
    clients_query = select(Client.status, func.count(Client.id)).group_by(Client.status)
    clients_result = await db.execute(clients_query)
    clients_by_status = dict(clients_result.all())

    # Count total users
    users_query = select(func.count(ClientUser.id))
    users_result = await db.execute(users_query)
    total_users = users_result.scalar()

    # Count active projects
    projects_query = select(func.count(ClientProject.id)).where(
        ClientProject.status.in_(["queued", "in_progress"])
    )
    projects_result = await db.execute(projects_query)
    active_projects = projects_result.scalar()

    return {
        "clients": {
            "total": sum(clients_by_status.values()),
            "by_status": clients_by_status
        },
        "users": {
            "total": total_users
        },
        "projects": {
            "active": active_projects
        }
    }


@router.post("/clients/{client_id}/activate")
async def activate_client(
    client_id: str,
    current_user: Dict = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, str]:
    """Activate a client (superuser only)"""

    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    client.status = "active"
    await db.commit()

    return {"message": f"Client {client.name} activated successfully"}


@router.post("/clients/{client_id}/suspend")
async def suspend_client(
    client_id: str,
    current_user: Dict = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, str]:
    """Suspend a client (superuser only)"""

    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    client.status = "suspended"
    await db.commit()

    return {"message": f"Client {client.name} suspended successfully"}