from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import models
from app.database.session import get_db
from pydantic import BaseModel
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password, verify_password, create_access_token, oauth2_scheme, decode_access_token

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter((models.User.username == user_in.username) | (models.User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login")
def login(form_data: dict, db: Session = Depends(get_db)):
    """
    Expects JSON: {"username": "...", "password": "..."}
    """
    username = form_data.get("username")
    password = form_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password required")
    user = db.query(models.User).filter((models.User.username == username) | (models.User.email == username)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.username, "user_id": user.id, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
