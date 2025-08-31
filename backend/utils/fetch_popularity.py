import pandas as pd
import time
import requests
from urllib.parse import quote
from dotenv import load_dotenv
import os

load_dotenv()  
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

def fetch_popularity_for_poi(name: str):
    params = {
        "query": name,
        "key": API_KEY
    }
    res = requests.get(SEARCH_URL, params=params).json()
    print(f"[SEARCH] {name}: {res}") 
    if res["status"] != "OK":
        return 0  
    place_id = res["results"][0]["place_id"]
    res_detail = requests.get(DETAILS_URL, params={"place_id": place_id, "key": API_KEY, "fields": "user_ratings_total,rating"}).json()
    if res_detail["status"] != "OK":
        return 0
    details = res_detail["result"]
    rating = details.get("rating", 0)
    count = details.get("user_ratings_total", 0)
    return int(rating * count)

def update_csv_popularity():
    df = pd.read_csv("data/poi_taipei_tagged.csv")
    for i, row in df.iterrows():
        name = row["name"]
        popularity = fetch_popularity_for_poi(name)
        df.at[i, "popularity"] = popularity
        print(f"{name}: {popularity}")
        time.sleep(1)  
    df.to_csv("data/poi_taipei_tagged.csv", index=False)
    print("popularity done")

if __name__ == "__main__":
    update_csv_popularity()