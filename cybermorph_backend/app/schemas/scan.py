from pydantic import BaseModel
from typing import List, Optional


class ScanResponse(BaseModel):
    filename: str
    verdict: str
    score: Optional[float]
    details: Optional[str]

    class Config:
        orm_mode = True
class Features(BaseModel):
    values: List[float]  # 512 features for EMBER model
