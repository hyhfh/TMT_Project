from datetime import date
from typing import List, Any

from pydantic import BaseModel, field_validator

# → 應該有對應的 Pydantic schema

class TripBase(BaseModel):
    start_date : date
    end_date   : date
    interests  : List[str] = []
    preferences: List[str] = []
    schedule   : Any       # 可依實際結構改型別

class TripCreate(TripBase):
    pass                    # 建立時跟 TripBase 相同即可

class TripOut(BaseModel):
    id: int
    user_id: int
    start_date: date
    end_date: date
    interests: List[str]
    preferences: List[str]
    schedule: Any
    
    @field_validator("interests", "preferences", mode="before")
    @classmethod
    def parse_json_list(cls, value: Any) -> Any:
        if isinstance(value, str):
            import json
            return json.loads(value)
        return value

    class Config:
        from_attributes = True

# class TripOut(TripBase):
#     id      : int

#     class Config:
#         orm_mode = True     # 讓 FastAPI 可以把 ORM 轉成 Pydantic