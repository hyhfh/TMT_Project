from sqlalchemy import Column, Integer, String, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
# from backend.database import Base  # 使用這個 Base
from backend.base import Base


Base = declarative_base()

class POI(Base):
    __tablename__ = "pois"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    category = Column(String)
    area = Column(String)
    description = Column(String)
    map_url = Column(String)    
    image_url = Column(String) 
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    
engine = create_engine("postgresql://REDACTED@localhost:5432/tailor_taipei")

# 建立資料庫連線 Session 工具
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # 建立 get_db 函式給 FastAPI Dependency 使用
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()