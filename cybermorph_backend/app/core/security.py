"""
JWT and Password Security Module

This module provides functions for secure password hashing, JWT token creation
and verification, and OAuth2-based authentication dependencies for protecting
API endpoints.
"""

from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.core.config import get_settings

# ============================
# Configuration
# ============================

settings = get_settings()

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting bearer tokens from requests
# NOTE: tokenUrl must match the actual login endpoint path
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# JWT configuration constants
JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# ============================
# Password Hashing Functions
# ============================

def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    
    Args:
        password: Plaintext password to hash
        
    Returns:
        str: Bcrypt-hashed password suitable for storage
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    
    Args:
        plain_password: Plaintext password to verify
        hashed_password: Bcrypt-hashed password to check against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

# ============================
# JWT Token Functions
# ============================

def create_access_token(data: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    """
    Create a JWT access token.
    
    Encodes the provided data with an expiration time into a JWT token
    using the configured secret key and algorithm.
    
    Args:
        data: Dictionary of claims to encode in the token
        expires_minutes: Optional custom expiration time in minutes.
                        Defaults to ACCESS_TOKEN_EXPIRE_MINUTES setting.
        
    Returns:
        str: Encoded JWT token as a string
    """
    to_encode = data.copy()
    
    # Set token expiration time
    expiration_minutes = expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expiration_minutes)
    to_encode.update({"exp": expire})
    
    # Encode and return token
    # PyJWT returns a str on encode
    token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT access token.
    
    Validates the token signature, expiration, and returns the payload.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Dict[str, Any]: Decoded token payload (claims)
        
    Raises:
        HTTPException: If token is expired (401) or invalid (401)
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_access_token_expires_seconds() -> int:
    """
    Get token expiration time in seconds.
    
    Returns:
        int: Access token expiration duration in seconds
    """
    return ACCESS_TOKEN_EXPIRE_MINUTES * 60

# ============================
# OAuth2 Dependency Functions
# ============================

def get_current_user_info(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency to extract and verify user info from JWT token.
    
    Can be used as a FastAPI dependency to require authentication.
    Extracts the bearer token from the Authorization header and decodes it.
    
    Args:
        token: Bearer token extracted from Authorization header
        
    Returns:
        Dict[str, Any]: Decoded token payload containing user information
        
    Raises:
        HTTPException: If no token provided (401) or token is invalid/expired (401)
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization required"
        )
    return decode_access_token(token)


def admin_required(user: Dict[str, Any] = Depends(get_current_user_info)) -> Dict[str, Any]:
    """
    Dependency to restrict access to admin users only.
    
    Used as a FastAPI dependency to enforce role-based access control.
    Requires that the authenticated user has "admin" role.
    
    Args:
        user: User information from get_current_user_info dependency
        
    Returns:
        Dict[str, Any]: User information if authorization succeeds
        
    Raises:
        HTTPException: If user role is not "admin" (403 Forbidden)
    """
    role = user.get("role")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    return user
