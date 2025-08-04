from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.recommendation.recommend_itinerary import recommend_itinerary
from typing import Optional, List
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.db_models import POI
import random
from datetime import datetime
from fastapi import HTTPException
from backend.schemas.poi import POIOut
import urllib.parse 

router = APIRouter()

class ItineraryRequest(BaseModel):
    start: str
    end: str
    interests: list[str]
    prefs: list[str]
    freeTextPreferences: Optional[str] = None
    
@router.post("/recommend_itinerary")
def recommend_itinerary(
    req: ItineraryRequest,
    db: Session = Depends(get_db),
):
    try:
        num_days = (datetime.strptime(req.end, "%Y-%m-%d") - datetime.strptime(req.start, "%Y-%m-%d")).days + 1
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format. Got start={req.start}, end={req.end}")
    
    # 1) 計算天數
    # num_days = (datetime.strptime(req.end, "%Y-%m-%d")
    #             - datetime.strptime(req.start, "%Y-%m-%d")).days + 1

    # 2) 從 DB 撈出所有 POI 並打分（簡化示範）
    df_pois = db.query(POI).all()
    # 2a) 興趣 match 標籤
    for poi in df_pois:
        poi._score = 0
        for tag in req.interests:
            if getattr(poi, tag.lower(), ""):
                poi._score += 1
        for kw in req.prefs:
            if kw.lower() in (poi.introduction or "").lower():
                poi._score += 1
        if req.freeTextPreferences and req.freeTextPreferences.lower() in (poi.introduction or "").lower():
            poi._score += 1
        poi._score += (poi.popularity or 0)

    # 2b) 排序、取前 N = days * 3
    sorted_pois = sorted(df_pois, key=lambda p: p._score, reverse=True)
    top_n = sorted_pois[: num_days * 3]

    # 3) 分配到每天
    itinerary = []
    for day in range(num_days):
        slice_ = top_n[day*3 : day*3+3]
        itinerary.append({
            "day": day+1,
            "pois": [
                {
                    "name":        p.name,
                    "description": p.introduction,
                    "area":        p.address,
                    "map_url": f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(p.name)}",
                    "image_url":   p.image_url,
                }
                for p in slice_
            ]
        })
    return {"itinerary": itinerary}