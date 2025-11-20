from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth_routes, scan_routes, user_routes
from app.database.base import Base, engine

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CyberMorph Backend")

# Allow your frontend origin (adjust if needed)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(scan_routes.router, prefix="/scan", tags=["scan"])
app.include_router(user_routes.router, prefix="/users", tags=["users"])


@app.get("/")
def root():
    return {"message": "CyberMorph backend is running"}
