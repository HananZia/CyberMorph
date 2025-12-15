import datetime
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from typing import Optional

class FileScanResult(BaseModel):
    filename: str
    verdict: str
    score: Optional[float]
    details: Optional[str]
    class Config:
        orm_mode = True

class Features(BaseModel):
    values: List[float]  # 512 features for EMBER model

class ScanResponse(BaseModel):
    id: int
    user_id: Optional[int]
    filename: str
    filepath: str
    sha256: Optional[str]
    verdict: str
    score: Optional[str]
    details: Optional[str]
    created_at: datetime
    class Config:
        orm_mode = True