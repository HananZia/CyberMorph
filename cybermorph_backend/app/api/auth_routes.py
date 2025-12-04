# app/api/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import random
import string

from app.database.session import get_db
from app.database import models
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token, get_access_token_expires_seconds
from app.core.email_utils import send_recovery_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------------
# REQUEST SCHEMAS
# ---------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    code: str
    token: str  # Token returned from forgot-password

class ResetPasswordRequest(BaseModel):
    code: str
    token: str
    new_password: str

# ---------------------
# TOKEN RESPONSE
# ---------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    role: str

# ---------------------
# REGISTER
# ---------------------
@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    username = user_in.username.strip()
    email = user_in.email.lower().strip()

    existing = db.query(models.User).filter(
        (models.User.username == username) | (models.User.email == email)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this username or email already exists."
        )

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

# ---------------------
# LOGIN
# ---------------------
@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    identifier = credentials.username.strip()

    user = db.query(models.User).filter(
        (models.User.username == identifier)
        | (models.User.email == identifier.lower())
    ).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

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

# ---------------------
# FORGOT PASSWORD
# ---------------------
def generate_6_digit_code():
    return ''.join(random.choices(string.digits, k=6))

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = request.email.lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate 6-digit code
    code = generate_6_digit_code()

    # Save to DB
    reset = models.PasswordReset(user_id=user.id, code=code)
    db.add(reset)
    db.commit()
    db.refresh(reset)

    # Create a token containing the reset_id
    token_payload = {
        "reset_id": reset.id,
        "exp": datetime.utcnow() + timedelta(minutes=15)  # token valid 15 minutes
    }
    token = create_access_token(token_payload)

    # Send code via email
    send_recovery_email(email, code)

    return {"token": token, "message": "Verification code sent to email."}

# ---------------------
# VERIFY CODE
# ---------------------
@router.post("/verify-code")
def verify_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(request.token)
    reset_id = payload.get("reset_id")
    if not reset_id:
        raise HTTPException(status_code=400, detail="Invalid token")

    reset = db.query(models.PasswordReset).filter(models.PasswordReset.id == reset_id).first()

    if not reset or reset.is_used or reset.code != request.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    return {"message": "Code verified successfully."}

# ---------------------
# RESET PASSWORD
# ---------------------
@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(request.token)
    reset_id = payload.get("reset_id")
    if not reset_id:
        raise HTTPException(status_code=400, detail="Invalid token")

    reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.id == reset_id,
        models.PasswordReset.is_used == False
    ).first()

    if not reset or reset.code != request.code:
        raise HTTPException(status_code=400, detail="Invalid code")

    # Expire after 15 minutes
    if reset.created_at < datetime.utcnow() - timedelta(minutes=15):
        raise HTTPException(status_code=400, detail="Code expired")

    # Update password
    user = db.query(models.User).filter(models.User.id == reset.user_id).first()
    user.password_hash = hash_password(request.new_password)
    reset.is_used = True

    db.commit()

    return {"message": "Password updated successfully."}
