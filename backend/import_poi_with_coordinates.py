import csv
from sqlalchemy.orm import Session
from db_models import POI, engine
from backend.base import Base

csv_file = "data/poi_taipei_with_coordinates.csv"

with open(csv_file, newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    with Session(bind=engine) as session:
        for row in reader:
            poi = POI(
                name=row["name"],
                category=row["category"],
                area=row["area"],
                description=row["description"],
                map_url=row["map_url"],
                image_url=row["image_url"],
                address=row["address"],
                latitude=row["latitude"],
                longitude=row["longitude"]
            )
            session.add(poi)
        session.commit()

print("Successfully.")