from sqlalchemy import Column, Integer, String, Float, create_engine, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from backend.base import Base


Base = declarative_base()

class POI(Base):
    __tablename__ = "pois"

    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name         = Column(String, nullable=False)       # csv 裡的 name
    introduction = Column(Text)                         # csv 裡的 introduction
    address      = Column(String)                       # csv 裡的 address
    lat          = Column(Float)                        # csv 裡的 lat
    lng          = Column(Float)                        # csv 裡的 lng
    image_url    = Column(String)                       # csv 裡的 image_url
    attraction   = Column(String)                       # csv 裡的 attraction
    food         = Column(String)                       # csv 裡的 food
    nature       = Column(String)                       # csv 裡的 nature
    culture      = Column(String)                       # csv 裡的 culture
    shopping     = Column(String)                       # csv 裡的 shopping
    popularity   = Column(Integer, nullable=True)           # csv 裡的 popularity