from sqlalchemy import Column, Integer, String
# from backend.database import Base
from backend.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String)
    
    trips = relationship("UserTrip", back_populates="user", cascade="all, delete-orphan")