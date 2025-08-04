import pandas as pd
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.db_models import POI

def load_popularity():
    df = pd.read_csv("data/poi_taipei_tagged.csv")
    db: Session = SessionLocal()
    for _, row in df.iterrows():
        name = row["name"]
        popularity = row["popularity"]
        poi = db.query(POI).filter(POI.name == name).first()
        if poi:
            poi.popularity = popularity
            print(f"✔ Updated {name} with popularity = {popularity}")
    db.commit()
    db.close()

if __name__ == "__main__":
    load_popularity()