# 示範用最陽春的 JWT 依賴
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
# from backend.database import SessionLocal
from backend.crud import trip as crud_trip
from backend.schemas.user_trip import TripCreate, TripOut
from backend.models.user import User
from backend.dependencies.auth import get_current_user
from backend.database import get_db


router = APIRouter(  # 整組路由都需要 JWT 驗證
    prefix="/trips",
    tags=["trips"],
    dependencies=[Depends(get_current_user)],   # 👈 全部 route 都需要驗證
)

@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_trip = crud_trip.create_trip(db, user_id=current_user.id, trip=trip)

    # ⭐ 明確轉換 ORM 成 TripOut schema，避免自動推斷錯誤
    trip_out = TripOut.from_orm(db_trip)
    return JSONResponse(content=jsonable_encoder(trip_out))

@router.get("/", response_model=list[TripOut])
def list_my_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trips = crud_trip.get_trips_by_user(db, user_id=current_user.id)
    print("🔍 Found trips:", trips)
    return trips
    # print("🔍 current_user.id =", current_user.id)
    # return crud_trip.get_trips_by_user(db, user_id=current_user.id)

# DELETE 特定行程
# @router.delete("/trips/{trip_id}")
# def delete_trip(trip_id: int, current_user: User = Depends(get_current_user)):
#     return crud_trip.delete_user_trip(trip_id, current_user.id)
@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = crud_trip.delete_user_trip(db, trip_id, current_user.id)
    if result["message"] == "Trip deleted":
        return result
    else:
        raise HTTPException(status_code=404, detail=result["message"])

# @router.post("/", status_code=status.HTTP_201_CREATED)
# def create_trip(
#     trip: TripCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     db_trip = crud_trip.create_trip(db, user_id=current_user.id, trip=trip)
#     return jsonable_encoder(db_trip)