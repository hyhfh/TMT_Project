from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import user, trip, poi, recommendation
from backend.database import engine  # 使用統一的 database.py
from backend.base import Base
from backend import models  # 載入模型（為了 Base.metadata.create_all 建表）

# 自動建立資料表
Base.metadata.create_all(bind=engine)

# 初始化 FastAPI App
app = FastAPI()

# CORS：允許前端跨域請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛載使用者相關的 router，掛載 Router 模組
app.include_router(user.router)
app.include_router(trip.router)
app.include_router(poi.router)
app.include_router(recommendation.router)