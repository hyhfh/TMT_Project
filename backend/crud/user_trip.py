from sqlalchemy.orm import Session
from backend.models.user_trip import UserTrip
from backend.schemas.user_trip import TripCreate

def create_trip(db: Session, user_id: int, trip: TripCreate) -> UserTrip:
    print(type(trip.interests))
    db_trip = UserTrip(
            user_id=user_id,
            start_date=trip.start_date,
            end_date=trip.end_date,
            interests=trip.interests,         # 保持 list
            preferences=trip.preferences,     # 保持 list
            schedule=trip.schedule,
        )
    db.add(db_trip)  # 把你建立的物件（這裡是 db_trip）加進資料庫 session，但還沒真正寫入資料庫。
    db.commit()  # 送出剛剛的 session，真正寫進資料庫。沒有這行就不會保存
    db.refresh(db_trip)  # 重新讀取物件資料（從資料庫抓回最新的內容），例如會補上自動產生的 id
    return db_trip

def get_trips_by_user(db: Session, user_id: int):
    return db.query(UserTrip).filter(UserTrip.user_id == user_id).order_by(UserTrip.id.desc()).all()