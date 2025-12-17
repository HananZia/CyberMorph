"""
Authentication and Password Reset API Routes

This module provides endpoints for:
- User registration and login
- JWT token generation and management
- Password reset and recovery flow
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import random
import string

from app.database.session import get_db
from app.database import models
from app.schemas.user import UserCreate, UserOut
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_access_token_expires_seconds,
)
from app.core.email_utils import send_recovery_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ============================
# Request and Response Schemas
# ============================


class LoginRequest(BaseModel):
    """Login credentials request."""
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    """Password recovery request with email address."""
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    """Verification code submission for password reset."""
    code: str
    token: str  # Token returned from forgot-password endpoint


class ResetPasswordRequest(BaseModel):
    """Password reset submission with new password."""
    code: str
    token: str
    new_password: str


class TokenResponse(BaseModel):
    """Successful login response containing JWT token."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    role: str

# ============================
# Helper Functions
# ============================


def generate_6_digit_code() -> str:
    """
    Generate a random 6-digit verification code.
    
    Returns:
        str: 6-digit numeric code as string
    """
    return ''.join(random.choices(string.digits, k=6))

# ============================
# Authentication Endpoints
# ============================


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Args:
        user_in: User registration data (username, email, password)
        db: Database session dependency
        
    Returns:
        UserOut: Created user object
        
    Raises:
        HTTPException: If username/email already exists (400) or database error (500)
    """
    username = user_in.username.strip()
    email = user_in.email.lower().strip()

    # Check for existing user
    existing = db.query(models.User).filter(
        (models.User.username == username) | (models.User.email == email)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this username or email already exists."
        )

    # Create new user with hashed password
    user = models.User(
        username=username,
        email=email,
        password_hash=hash_password(user_in.password),
        role="user",
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error while creating user"
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.
    
    Args:
        credentials: Login credentials (username/email and password)
        db: Database session dependency
        
    Returns:
        TokenResponse: JWT token, token type, expiration time, user ID, and role
        
    Raises:
        HTTPException: If credentials are invalid (401)
    """
    identifier = credentials.username.strip()

    # Query user by username or email
    user = db.query(models.User).filter(
        (models.User.username == identifier)
        | (models.User.email == identifier.lower())
    ).first()

    # Verify password
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    # Create JWT token with user claims
    payload = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
    }

    token = create_access_token(payload)
    expires_in = get_access_token_expires_seconds()

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user_id": user.id,
        "role": user.role,
    }

# ============================
# Password Reset Endpoints
# ============================


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiate password reset by sending verification code to email.
    
    Args:
        request: Forgot password request with user email
        db: Database session dependency
        
    Returns:
        dict: Reset token (valid for 15 minutes) and confirmation message
        
    Raises:
        HTTPException: If user with email not found (404)
    """
    email = request.email.lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate 6-digit verification code
    code = generate_6_digit_code()

    # Save reset request to database
    reset = models.PasswordReset(user_id=user.id, code=code)
    db.add(reset)
    db.commit()
    db.refresh(reset)

    # Create reset token (valid for 15 minutes)
    token_payload = {
        "reset_id": reset.id,
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    token = create_access_token(token_payload)

    # Send code via email
    send_recovery_email(email, code)

    return {"token": token, "message": "Verification code sent to email."}


@router.post("/verify-code")
def verify_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Verify password reset code without changing password.
    
    Args:
        request: Verification request with code and reset token
        db: Database session dependency
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If token invalid (400), code invalid/expired (400),
                      or code doesn't match (400)
    """
    payload = decode_access_token(request.token)
    reset_id = payload.get("reset_id")
    
    if not reset_id:
        raise HTTPException(status_code=400, detail="Invalid token")

    # Retrieve reset request
    reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.id == reset_id
    ).first()

    # Verify reset exists, hasn't been used, and code matches
    if not reset or reset.is_used or reset.code != request.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    return {"message": "Code verified successfully."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset user password after code verification.
    
    Args:
        request: Reset password request with code, token, and new password
        db: Database session dependency
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If token invalid (400), code invalid (400), 
                      code expired (400), or database error
    """
    payload = decode_access_token(request.token)
    reset_id = payload.get("reset_id")
    
    if not reset_id:
        raise HTTPException(status_code=400, detail="Invalid token")

    # Retrieve unused reset request
    reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.id == reset_id,
        models.PasswordReset.is_used == False
    ).first()

    # Verify reset exists and code matches
    if not reset or reset.code != request.code:
        raise HTTPException(status_code=400, detail="Invalid code")

    # Check if code has expired (15 minute limit)
    if reset.created_at < datetime.utcnow() - timedelta(minutes=15):
        raise HTTPException(status_code=400, detail="Code expired")

    # Update user password and mark reset as used
    user = db.query(models.User).filter(models.User.id == reset.user_id).first()
    user.password_hash = hash_password(request.new_password)
    reset.is_used = True

    db.commit()

    return {"message": "Password updated successfully."}

