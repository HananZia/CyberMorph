from fastapi import APIRouter, HTTPException, Depends
from app.core.malware import predict_malware
from app.schemas.scan import Features
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/predict", tags=["predict"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/")
def predict(data: Features, token: str = Depends(oauth2_scheme)):
    try:
        prob = predict_malware(data.values)
        return {"malware_probability": prob}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
