from sqlalchemy.orm import Session
from backend.models.user_trip import UserTrip
from backend.schemas.user_trip import TripCreate, TripOut

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