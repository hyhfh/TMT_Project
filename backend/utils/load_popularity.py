import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))  # 加入 Project_hua/

import pandas as pd
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.db_models import POI

def update_popularity_from_csv(csv_path: str):
    df = pd.read_csv(csv_path)
    db: Session = SessionLocal()

    for _, row in df.iterrows():
        name = row['name']
        popularity = row.get('popularity')
        if pd.notna(popularity):
            poi = db.query(POI).filter(POI.name == name).first()
            if poi:
                poi.popularity = int(popularity)
                print(f"✅ Updated {name} with popularity = {popularity}")
    db.commit()
    db.close()
    print("🎉 All popularity values imported to database.")

if __name__ == "__main__":
    update_popularity_from_csv("data/poi_taipei_tagged.csv")