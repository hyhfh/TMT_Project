from fastapi import APIRouter, Depends,HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Set
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.db_models import POI
from datetime import datetime
from backend.schemas.poi import POIOut
from backend.recommendation.recommend_itinerary import (recommend_itinerary as recommend_itinerary_logic,)
from sqlalchemy import select
from backend.recommendation.recommend_itinerary import sanitize_itinerary

router = APIRouter()

try:
    from pydantic import ConfigDict
    V2 = True
except Exception:
    V2 = False

class ItineraryRequest(BaseModel):
    start: str
    end: str
    interests: list[str]
    prefs: list[str]
    free_text_preferences: Optional[str] = Field(None, alias="freeTextPreferences")
    selected_poi_ids: Optional[List[int]] = []  

    if V2:
        # Pydantic v2：model_config
        model_config = ConfigDict(validate_by_name=True)
    else:
        # Pydantic v1
        class Config:
            allow_population_by_field_name = True
    
@router.post("/recommend_itinerary")
def recommend_itinerary(
    req: ItineraryRequest,
    db: Session = Depends(get_db),
):
    try:
        datetime.strptime(req.start, "%Y-%m-%d")
        datetime.strptime(req.end, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format. Got start={req.start}, end={req.end}",
        )
    itinerary = recommend_itinerary_logic(
        start=req.start,
        end=req.end,
        interests=req.interests or [],
        prefs=req.prefs or [],
        free_text_preferences = req.free_text_preferences,
        selected_poi_ids=req.selected_poi_ids or [],  
        db=db,
    )
    valid_ids_set = set(db.execute(select(POI.id)).scalars().all())  
    must_ids = set(req.selected_poi_ids or [])                     
    itinerary = sanitize_itinerary(itinerary, valid_ids_set, must_ids)
    return {"itinerary_json": itinerary}