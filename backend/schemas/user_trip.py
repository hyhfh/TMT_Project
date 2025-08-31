from datetime import date
from typing import List, Any
from pydantic import BaseModel, field_validator

class TripBase(BaseModel):
    start_date : date
    end_date   : date
    interests  : List[str] = []
    preferences: List[str] = []
    schedule   : Any       

class TripCreate(TripBase):
    pass                    

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