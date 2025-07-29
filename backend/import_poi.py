import csv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models import POI
# from backend.database import Base
from backend.base import Base

# PostgreSQL 連線字串
DATABASE_URL = "postgresql://REDACTED@localhost:5432/tailor_taipei"

# 建立資料庫連線與 session
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# 建立資料表
Base.metadata.create_all(engine)

# 匯入 CSV
with open("data/poi_taipei.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        poi = POI(
            name=row["name"],
            category=row["category"],
            description=row["description"],
            address=row["address"],
            latitude=float(row["latitude"]),
            longitude=float(row["longitude"])
        )
        session.add(poi)

session.commit()
print("✅ 匯入完成")