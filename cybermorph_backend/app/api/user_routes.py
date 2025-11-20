from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import models
from app.database.session import get_db
from app.core.security import decode_access_token, oauth2_scheme
from app.schemas.user import UserOut

router = APIRouter()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/me", response_model=UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user
