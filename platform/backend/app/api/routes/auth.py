"""
Authentication API Routes
Handles login for both platform administrators and client users
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from ...core.database import get_database
from ...core.auth import AuthService, create_openai_realtime_token


router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    client_id: str = None  # Optional for client login


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


@router.post("/platform/login", response_model=LoginResponse)
async def platform_login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_database)
) -> LoginResponse:
    """Platform administrator login"""

    auth_service = AuthService(db)
    user = await auth_service.authenticate_platform_user(
        email=request.email,
        password=request.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = auth_service.create_platform_token(user)

    return LoginResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "user_type": "platform",
            "is_superuser": user.is_superuser
        }
    )


@router.post("/client/login", response_model=LoginResponse)
async def client_login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_database)
) -> LoginResponse:
    """Client user login"""

    if not request.client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client ID required for client login"
        )

    auth_service = AuthService(db)
    user = await auth_service.authenticate_client_user(
        email=request.email,
        password=request.password,
        client_id=request.client_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or client"
        )

    token = auth_service.create_client_token(user)

    return LoginResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "user_type": "client",
            "is_admin": user.is_admin,
            "client_id": str(user.client_id)
        }
    )


@router.get("/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(create_openai_realtime_token)
) -> Dict[str, Any]:
    """Get current user information"""
    return current_user


@router.post("/realtime-token")
async def get_realtime_token(
    current_user: Dict[str, Any] = Depends(create_openai_realtime_token)
) -> Dict[str, Any]:
    """Get OpenAI Realtime API token for voice interface"""
    return await create_openai_realtime_token(current_user)


@router.post("/logout")
async def logout() -> Dict[str, str]:
    """Logout (client-side token removal)"""
    return {"message": "Logged out successfully"}