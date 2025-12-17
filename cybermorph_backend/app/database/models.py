"""
SQLAlchemy ORM Models for CyberMorph Database

This module defines the database schema for:
- User accounts with authentication credentials and role management
- Scan logs tracking malware detection results
- Password reset tokens for account recovery
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


# ============================
# User Model
# ============================

class User(Base):
    """
    User account model for storing user credentials and metadata.
    
    Attributes:
        id: Primary key, unique user identifier
        username: Unique username for login (max 128 chars)
        email: Unique email address (max 256 chars)
        password_hash: Bcrypt-hashed password
        role: User role ('user' or 'admin'), defaults to 'user'
        created_at: Account creation timestamp (auto-populated)
        scans: Relationship to associated ScanLog records
        resets: Relationship to associated PasswordReset records
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(50), default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scans = relationship("ScanLog", back_populates="user")
    resets = relationship("PasswordReset", back_populates="user")


# ============================
# Scan Log Model
# ============================

class ScanLog(Base):
    """
    Scan log model for recording file scan results and metadata.
    
    Attributes:
        id: Primary key, unique scan log identifier
        user_id: Foreign key to User who performed the scan (nullable for anonymous scans)
        filename: Name of the scanned file (max 512 chars)
        filepath: Full path where file was stored (max 1024 chars)
        sha256: SHA-256 hash of the file contents (optional)
        verdict: Detection result ('malicious', 'benign', 'suspicious', etc.)
        score: Malware probability score as string (can be JSON or decimal string)
        details: Additional scan metadata and notes
        created_at: Scan timestamp (auto-populated)
        user: Relationship to User who performed the scan
    """
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(512), nullable=False)
    filepath = Column(String(1024), nullable=False)
    sha256 = Column(String(128), nullable=True)
    verdict = Column(String(32), nullable=False)
    score = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="scans")


# ============================
# Password Reset Model
# ============================

class PasswordReset(Base):
    """
    Password reset token model for account recovery flow.
    
    Attributes:
        id: Primary key, unique reset request identifier
        user_id: Foreign key to User requesting password reset
        code: 6-digit verification code sent to email
        created_at: Reset request creation timestamp
        is_used: Boolean flag indicating if reset code has been used
        user: Relationship to User making the reset request
    """
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code = Column(String(6), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_used = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="resets")
