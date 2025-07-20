from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import csv
from fastapi.responses import JSONResponse
import requests

app = FastAPI()

# 允許前端跨域請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發時先設成 *，正式部署時應設定指定網域
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 讀取 CSV 檔案
def load_poi_data():
    pois = []
    with open("data/poi_taipei.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)  # 把每一行資料轉成字典
        for row in reader:
            row["category"] = [c.strip() for c in row["category"].split(",")]
            pois.append(row)
        # for row in reader:
        #     pois.append(row)
    return pois

# API 路由：回傳所有景點資料
@app.get("/api/pois")
def get_pois():
    return JSONResponse(content=load_poi_data())

# 即時天氣 路由
WEATHER_API_KEY = "252d2b3be8b1f208ec09327f10cdb1d1" 

@app.get("/api/weather")
def get_current_weather():
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()
    
    # 👇 新增這一行：取得天氣 icon 編號
    icon = data["weather"][0]["icon"]
    
    return {
        "temp": data["main"]["temp"],
        "description": data["weather"][0]["description"],
        "icon": icon  # 👈 把 icon 加進回傳內容
        # "icon": data["weather"][0]["icon"]
    }
    
@app.get("/api/weather_forecast")
def get_weather_forecast():
    city = "Taipei"
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    return response.json()


# 後端（FastAPI）＋機票連結思路
# 2‑1  新增 /api/itinerary
# 簡化範例：直接回傳收到的參數
@app.get("/api/itinerary")
def generate_itinerary(
    start: str = Query(...),
    end: str = Query(...),
    interests: str = Query(""),
    prefs: str = Query(""),
):
    """
    真正專題裡，你可以：
    1. 轉成 datetime 計算停留天數
    2. 用 interests / prefs 做 Content‑Based 推薦
    3. 回傳每天建議景點（可從 poi_taipei.csv 選擇）
    """
    return {
        "start": start,
        "end": end,
        "interests": interests.split(",") if interests else [],
        "preferences": prefs.split(",") if prefs else [],
        "schedule": [
            # 這裡放每天行程
        ],
    }