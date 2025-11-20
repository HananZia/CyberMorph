from pydantic import BaseModel
from typing import Optional


class ScanResponse(BaseModel):
    filename: str
    verdict: str
    details: Optional[str] = None
