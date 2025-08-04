from sqlalchemy.orm import sessionmaker
from backend.db_models import POI
from backend.base import Base
import pandas as pd
from pathlib import Path
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://REDACTED@localhost:5432/tailor_taipei"
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


# import csv
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from backend.db_models import POI
# # from backend.database import Base
# from backend.base import Base
# import pandas as pd
# from pathlib import Path

# # ─── 1) 連上同一個資料庫 ─────────────────────────────────────
# DATABASE_URL = "postgresql://REDACTED@localhost:5432/tailor_taipei"
# engine = create_engine(DATABASE_URL)
# Session = sessionmaker(bind=engine)
# session = Session()

# # ─── 2) drop + create table ──────────────────────────────────
# # 先把 POI 表丟掉（如果存在的話），接著再重建
# Base.metadata.drop_all(bind=engine, tables=[POI.__table__])  # 之後如果只想「更新一次」不想每次都 drop，你也可以把 drop_all() 拿掉，每次跑時它會自動檢查「若 table 不在就建它」。
# Base.metadata.create_all(bind=engine, tables=[POI.__table__])
# print("✅ 已 drop & create pois table")

# # ─── 3) 讀 CSV ──────────────────────────────────────────────
# csv_path = Path(__file__).parent.parent / "data" / "poi_taipei_tagged.csv"
# df = pd.read_csv(csv_path, encoding="utf-8")
# # DATA_PATH = Path(__file__).parent.parent.parent / "data" / "poi_taipei_tagged.csv"
# # df = pd.read_csv(DATA_PATH, encoding="utf-8")

# # ─── 4) 一筆一筆匯入 ORM，再 commit ────────────────────────────
# for _, row in df.iterrows():
#     poi = POI(
#         name         = row["name"],
#         introduction = row["introduction"],
#         address      = row["address"],
#         lat          = float(row["lat"]),
#         lng          = float(row["lng"]),
#         image_url    = row["image_url"] if pd.notna(row["image_url"]) else None,
#         attraction   = row["attraction"] if pd.notna(row["attraction"]) else "",
#         food         = row["food"]       if pd.notna(row["food"])       else "",
#         nature       = row["nature"]     if pd.notna(row["nature"])     else "",
#         culture      = row["culture"]    if pd.notna(row["culture"])    else "",
#         shopping     = row["shopping"]   if pd.notna(row["shopping"])   else "",
#         popularity   = int(row["popularity"]) if "popularity" in row and pd.notna(row["popularity"]) else 0,
#     )
#     session.add(poi)

# session.commit()
# print("✅ 已匯入所有 POI")
