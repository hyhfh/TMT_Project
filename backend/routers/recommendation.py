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


router = APIRouter()

# Pydantic v2 / v1 兼容處理 
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
    # 同時接受 camelCase 與 snake_case
    free_text_preferences: Optional[str] = Field(None, alias="freeTextPreferences")
    selected_poi_ids: Optional[List[int]] = []  

    if V2:
        # Pydantic v2：使用 model_config
        # 部分版本訊息會說 validate_by_name=True；較常見的是 populate_by_name=True
        # 二擇一皆可，視你環境而定；先用 validate_by_name=True（符合你的警告訊息）
        model_config = ConfigDict(validate_by_name=True)
    else:
        # Pydantic v1：舊寫法
        class Config:
            allow_population_by_field_name = True
    
@router.post("/recommend_itinerary")
def recommend_itinerary(
    req: ItineraryRequest,
    db: Session = Depends(get_db),
):
    # 驗證日期格式
    try:
        datetime.strptime(req.start, "%Y-%m-%d")
        datetime.strptime(req.end, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format. Got start={req.start}, end={req.end}",
        )
    # 呼叫邏輯層，規則/LLM 產生行程
    itinerary = recommend_itinerary_logic(
        start=req.start,
        end=req.end,
        interests=req.interests or [],
        prefs=req.prefs or [],
        free_text_preferences = req.free_text_preferences,
        selected_poi_ids=req.selected_poi_ids or [],   
        db=db,
    )
    return itinerary

    # ###
    # # Step C: 檢查 / 修復 itinerary
    # valid_ids_set = set(db.execute(select(POI.id)).scalars().all())  # 取得資料庫裡的所有 POI id
    # must_ids = set(req.selected_poi_ids or [])                      # 使用者強制選擇的 POI id

    # # 執行 sanitize_itinerary
    # itinerary = sanitize_itinerary(itinerary, valid_ids_set, must_ids)

    # # Step D: 回傳 JSON
    # return {"itinerary_json": itinerary}
    # ###