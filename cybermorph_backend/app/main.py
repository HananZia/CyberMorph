from fastapi import FastAPI
from app.api import auth_routes
from app.api import auth_utils, predict
from app.database.base import Base, engine
from app.core.config import get_settings
from app.api.auth_routes import router
from app.api import auth_utils, predict, file_scan, logs
from app.database.base import Base, engine
from app.core.config import get_settings

router = auth_routes.router

settings = get_settings()
# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Based Antivirus & Malware Detection System")

# Include Routers
app.include_router(router)
app.include_router(predict.router)
# Authentication & User
app.include_router(auth_routes.router, prefix="/auth")
# Malware prediction
app.include_router(predict.router, prefix="/predict")
# File scanning
app.include_router(file_scan.router, prefix="/file")
# Logs/history
app.include_router(logs.router, prefix="/logs")


@app.get("/health")
def health_check():
    return {"status": "ok"}
