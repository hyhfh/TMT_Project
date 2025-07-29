from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship

# from backend.database import Base      # 你原本的 database.py 已經 export Base
from backend.base import Base
from backend.models.user import User     # 如果 user model 叫 models/user.py

#  → 應該已經有儲存 user_id 對應行程的資料表

class UserTrip(Base):
    __tablename__ = "user_trips"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    start_date  = Column(Date, nullable=False)
    end_date    = Column(Date, nullable=False)
    # interests = Column(JSON, nullable=False)     # 改為 JSON
    # preferences = Column(JSON, nullable=False)   # 改為 JSON
    interests = Column(JSON, nullable=False, default=list)
    preferences = Column(JSON, nullable=False, default=list)
    # interests   = Column(String)          # ["Food","Nature"] -> 以逗號或 JSON 存都行
    # preferences = Column(String)          # 同上
    schedule    = Column(JSON, nullable=False)  # 直接塞你產的 daily_itinerary

    # ORM 關聯 (可選)
    user = relationship("User", back_populates="trips")