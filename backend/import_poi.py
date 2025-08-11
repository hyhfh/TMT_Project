from sqlalchemy.orm import sessionmaker
from backend.db_models import POI
from backend.base import Base
import pandas as pd
from pathlib import Path
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()  # 載入.env檔案
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# 重新建立資料表
Base.metadata.drop_all(bind=engine, tables=[POI.__table__])
Base.metadata.create_all(bind=engine, tables=[POI.__table__])
print("✅ Drop & Create POI table")

# 載入 CSV
csv_path = Path(__file__).parent.parent / "data" / "poi_taipei_tagged.csv"
df = pd.read_csv(csv_path, encoding="utf-8")

# 寫入資料
for _, row in df.iterrows():
    poi = POI(
        name=row["name"],
        introduction=row["introduction"],
        address=row["address"],
        lat=float(row["lat"]),
        lng=float(row["lng"]),
        image_url=row["image_url"] if pd.notna(row["image_url"]) else None,
        attraction=row["attraction"] if pd.notna(row["attraction"]) else "",
        food=row["food"] if pd.notna(row["food"]) else "",
        nature=row["nature"] if pd.notna(row["nature"]) else "",
        culture=row["culture"] if pd.notna(row["culture"]) else "",
        shopping=row["shopping"] if pd.notna(row["shopping"]) else "",
        popularity=int(row["popularity"]) if "popularity" in row and pd.notna(row["popularity"]) else 0,
    )
    session.add(poi)

session.commit()
print("✅ 已寫入所有 POI")