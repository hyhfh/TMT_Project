from sqlalchemy.orm import Session
from backend.models.user_trip import UserTrip
from backend.schemas.user_trip import TripCreate

def create_trip(db: Session, user_id: int, trip: TripCreate) -> UserTrip:
    print(type(trip.interests))
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
    return db.query(UserTrip).filter(UserTrip.user_id == user_id).order_by(UserTrip.id.desc()).all()