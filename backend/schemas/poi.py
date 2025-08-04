from pydantic import BaseModel
from typing import Optional

class POIOut(BaseModel):
    id: int
    name: str
    introduction: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_url: Optional[str] = None
    popularity: Optional[int] = None

    class Config:
        from_attributes = True