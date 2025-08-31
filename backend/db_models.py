from sqlalchemy import Column, Integer, String, Float, create_engine, Text
from sqlalchemy.ext.declarative import declarative_base
from backend.base import Base

Base = declarative_base()

class POI(Base):
    __tablename__ = "pois"

    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name         = Column(String, nullable=False)       
    introduction = Column(Text)                       
    address      = Column(String)                  
    lat          = Column(Float)           
    lng          = Column(Float)                        
    image_url    = Column(String)                      
    attraction   = Column(String)                   
    food         = Column(String)              
    nature       = Column(String)                 
    culture      = Column(String)                
    shopping     = Column(String)                       
    popularity   = Column(Integer, nullable=True)         