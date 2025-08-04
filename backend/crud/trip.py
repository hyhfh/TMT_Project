'''
user_trip.py 是你原本處理建立行程（Create）的 CRUD
若你有其他操作（像查詢、刪除），建議分到 trip.py 可讀性較高
若你之後會新增編輯/查詢歷史行程/篩選功能，也會放進這個檔案
'''
from sqlalchemy.orm import Session
from backend.models.user_trip import UserTrip
from backend.schemas.user_trip import TripCreate, TripOut
from typing import List

# 原本可能是測試用途或初版寫的 CRUD，未與 user 綁定， 可刪除（或整併）
# 建立新行程
def create_trip(db: Session, user_id: int, trip: TripCreate) -> TripOut:
    db_trip = UserTrip(
        user_id=user_id,
        start_date=trip.start_date,
        end_date=trip.end_date,
        interests=trip.interests,
        preferences=trip.preferences,
        schedule=trip.schedule,
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

def get_trips_by_user(db: Session, user_id: int):
    trips = db.query(UserTrip).filter(UserTrip.user_id == user_id).all()
    return trips

def delete_user_trip(db: Session, trip_id: int, user_id: int):
    trip = db.query(UserTrip).filter(UserTrip.id == trip_id, UserTrip.user_id == user_id).first()
    if trip:
        db.delete(trip)
        db.commit()
        return {"message": "Trip deleted"}
    else:
        return {"message": "Trip not found or unauthorized"}