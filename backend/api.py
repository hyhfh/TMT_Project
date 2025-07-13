from fastapi import FastAPI
import csv
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 設定，讓 Next.js 可以連接
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 發布時應限定來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/poi")
def get_poi():
    poi_list = []
    with open("../data/poi_taipei.csv", newline='', encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            poi_list.append(row)
    return poi_list