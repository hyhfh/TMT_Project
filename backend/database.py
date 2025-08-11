from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.base import Base
from dotenv import load_dotenv
import os

# from backend.models import user, user_trip   # <-- 只要 import 就能註冊 model 到 Base.metadata（方便自動建表）

# 原本設定的 PostgreSQL URI
load_dotenv()  # 載入.env檔案
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# FastAPI 依賴注入用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
