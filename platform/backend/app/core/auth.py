"""
Unified Authentication System for CRMBLR Platform
Combines CRMBLR's JWT system with Make-Lit's user models for multi-tenant support
"""

import os
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt

from .database import get_database
from ..models.platform import PlatformUser, Client, ClientUser


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8  # 8 days


def get_secret_key() -> str:
    """Get JWT secret key from environment"""
    key = os.getenv("SECRET_KEY")
    if not key:
        raise RuntimeError("SECRET_KEY not configured")
    return key


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


# FastAPI Dependencies

http_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: AsyncSession = Depends(get_database)
) -> Dict[str, Any]:
    """Get current authenticated user (platform user or client user)"""

    if not credentials or not credentials.scheme.lower() == "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify token
    payload = verify_token(credentials.credentials)

    user_id = payload.get("sub")
    user_type = payload.get("user_type", "platform")  # "platform" or "client"

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    if user_type == "platform":
        # Platform administrator
        result = await db.execute(select(PlatformUser).where(PlatformUser.id == user_id))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        return {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "user_type": "platform",
            "is_superuser": user.is_superuser,
            "client_id": None
        }

    elif user_type == "client":
        # Client organization user
        client_id = payload.get("client_id")

        if not client_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing client ID in token"
            )

        result = await db.execute(
            select(ClientUser).where(
                ClientUser.id == user_id,
                ClientUser.client_id == client_id
            )
        )
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        return {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "user_type": "client",
            "is_admin": user.is_admin,
            "client_id": str(user.client_id)
        }

    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user type"
        )


async def get_current_platform_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Require platform user (for admin operations)"""
    if current_user["user_type"] != "platform":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform access required"
        )
    return current_user


async def get_current_client_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Require client user (for client CRM access)"""
    if current_user["user_type"] != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client access required"
        )
    return current_user


async def get_current_superuser(
    current_user: Dict[str, Any] = Depends(get_current_platform_user)
) -> Dict[str, Any]:
    """Require platform superuser"""
    if not current_user.get("is_superuser"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser access required"
        )
    return current_user


# Authentication Services

class AuthService:
    """Authentication service for platform and client users"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate_platform_user(self, email: str, password: str) -> Optional[PlatformUser]:
        """Authenticate platform user"""
        result = await self.db.execute(
            select(PlatformUser).where(PlatformUser.email == email)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    async def authenticate_client_user(self, email: str, password: str, client_id: str) -> Optional[ClientUser]:
        """Authenticate client user"""
        result = await self.db.execute(
            select(ClientUser).where(
                ClientUser.email == email,
                ClientUser.client_id == client_id
            )
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    def create_platform_token(self, user: PlatformUser) -> str:
        """Create access token for platform user"""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type": "platform"
        }
        return create_access_token(token_data)

    def create_client_token(self, user: ClientUser) -> str:
        """Create access token for client user"""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type": "client",
            "client_id": str(user.client_id)
        }
        return create_access_token(token_data)


# OpenAI Realtime Token (from original CRMBLR)

async def create_openai_realtime_token(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create ephemeral token for OpenAI Realtime API
    Available to both platform and client users
    """
    import requests

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured"
        )

    # Load instructions based on user type
    if current_user["user_type"] == "client":
        # Client users get CRM-specific instructions
        instructions = f"""
        You are a helpful AI assistant for {current_user.get('full_name', 'the user')}'s CRM system.
        You can help them search contacts, create records, and analyze their data.
        Always be helpful and accurate with their organizational data.
        """
    else:
        # Platform users get general instructions
        instructions = """
        You are a helpful AI assistant for the CRMBLR platform.
        You can help with general queries and system information.
        """

    # Define available functions (will expand based on user's modules)
    tools = [
        {
            "type": "function",
            "name": "search_contacts",
            "description": "Search for contacts in the CRM",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "limit": {"type": "integer", "default": 10}
                },
                "required": ["query"]
            }
        },
        {
            "type": "function",
            "name": "get_dashboard_stats",
            "description": "Get dashboard statistics",
            "parameters": {"type": "object", "properties": {}}
        }
    ]

    session_config = {
        "session": {
            "type": "realtime",
            "model": "gpt-realtime",
            "audio": {"output": {"voice": "marin"}},
            "tools": tools,
            "tool_choice": "auto",
            "instructions": instructions
        }
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/realtime/client_secrets",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=session_config,
            timeout=10,
        )
        return {"token": response.json(), "status_code": response.status_code}
    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate OpenAI token"
        )