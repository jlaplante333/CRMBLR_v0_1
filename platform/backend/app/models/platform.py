"""
Platform-level models for multi-tenant management
These models exist in the main schema and manage clients/billing/etc.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class ClientStatus(str, Enum):
    """Client account status"""
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"


class ClientPlan(str, Enum):
    """Client subscription plans matching website pricing"""
    SMALL = "small"      # $500 setup + $500/month (5 users)
    MEDIUM = "medium"    # $1000 setup + $1000/month (10 users)
    UNLIMITED = "unlimited"  # $2000 setup + $2000/month (unlimited)


class Client(Base):
    """
    Client organizations (SOMA West, Client #2, etc.)
    Main tenant entity for multi-tenant architecture
    """
    __tablename__ = "clients"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic info
    name = Column(String(255), nullable=False, index=True)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), nullable=True)  # custom domain if any

    # Organization details
    organization_type = Column(String(100), nullable=False)  # "cbd", "nonprofit", etc.
    template_id = Column(String(100), nullable=False)  # which template they use

    # Subscription
    plan = Column(String(20), nullable=False, default=ClientPlan.SMALL)
    status = Column(String(20), nullable=False, default=ClientStatus.ONBOARDING)
    max_users = Column(Integer, nullable=False, default=5)

    # Billing
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    setup_fee_paid = Column(Boolean, default=False)

    # Configuration
    configuration = Column(JSON, nullable=False, default=dict)
    branding = Column(JSON, nullable=False, default=dict)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True), nullable=True)

    # Contact info
    primary_contact_email = Column(String(255), nullable=False)
    primary_contact_name = Column(String(255), nullable=False)

    # Relationships
    users = relationship("ClientUser", back_populates="client", cascade="all, delete-orphan")
    projects = relationship("ClientProject", back_populates="client", cascade="all, delete-orphan")

    @property
    def setup_fee(self) -> int:
        """Get setup fee based on plan"""
        fees = {
            ClientPlan.SMALL: 500,
            ClientPlan.MEDIUM: 1000,
            ClientPlan.UNLIMITED: 2000
        }
        return fees.get(self.plan, 500)

    @property
    def monthly_fee(self) -> int:
        """Get monthly fee based on plan"""
        fees = {
            ClientPlan.SMALL: 500,
            ClientPlan.MEDIUM: 1000,
            ClientPlan.UNLIMITED: 2000
        }
        return fees.get(self.plan, 500)

    @property
    def user_limit(self) -> int:
        """Get user limit based on plan"""
        limits = {
            ClientPlan.SMALL: 5,
            ClientPlan.MEDIUM: 10,
            ClientPlan.UNLIMITED: 999999
        }
        return limits.get(self.plan, 5)


class ClientUser(Base):
    """
    Users within client organizations
    Similar to Make-Lit User but scoped to client
    """
    __tablename__ = "client_users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Client association
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)

    # User details
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)

    # Permissions
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Admin within the client org

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    client = relationship("Client", back_populates="users")

    # Ensure unique email per client
    __table_args__ = (
        {"schema": None},  # Will be set by client
    )


class ClientProject(Base):
    """
    Setup/onboarding projects for new clients
    Tracks progress from payment to launch
    """
    __tablename__ = "client_projects"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Client association
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)

    # Project details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Status tracking
    status = Column(String(50), nullable=False, default="payment_pending")
    progress_percentage = Column(Integer, default=0)

    # Timeline
    estimated_completion = Column(DateTime(timezone=True), nullable=True)
    actual_completion = Column(DateTime(timezone=True), nullable=True)

    # Files and configuration
    uploaded_files = Column(JSON, default=list)  # List of file paths
    configuration_data = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", back_populates="projects")


class PlatformUser(Base):
    """
    Platform administrators (you and your team)
    Separate from client users
    """
    __tablename__ = "platform_users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # User details
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Permissions
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)