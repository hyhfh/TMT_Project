from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.base import Base
from backend.models.user import User    
class UserTrip(Base):
    __tablename__ = "user_trips"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    start_date  = Column(Date, nullable=False)
    end_date    = Column(Date, nullable=False)
    interests   = Column(JSON, nullable=False, default=list)
    preferences = Column(JSON, nullable=False, default=list)
    schedule    = Column(JSON, nullable=False) 

    user = relationship("User", back_populates="trips")