from pydantic import BaseModel
from typing import List, Optional


class ScanResponse(BaseModel):
    filename: str
    verdict: str
    score: Optional[float] = None
    details: Optional[str] = None
class Features(BaseModel):
    values: List[float]  # 512 features for EMBER model
