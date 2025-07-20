from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class POI(Base):
    __tablename__ = "pois"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    category = Column(String)
    description = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)