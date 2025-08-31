import pandas as pd
import os
from serpapi import GoogleSearch
from dotenv import load_dotenv

load_dotenv()  
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
CSV_PATH = "data/poi_taipei_tagged.csv"

def search_google_image(query):
    params = {
        "q": query,
        "tbm": "isch",
        "api_key": API_KEY,
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    try:
        first_image = results["images_results"][0]["original"]
        return first_image
    except Exception:
        return ""

def main():
    print("Searching from Google...")
    df = pd.read_csv(CSV_PATH)
    for idx, row in df.iterrows():
        if pd.isna(row["image_url"]) or row["image_url"] == "":
            poi_name = row["name"]
            image_url = search_google_image(f"{poi_name} Taipei")
            if image_url:
                df.at[idx, "image_url"] = image_url
                print(f"{poi_name} got pics")
            else:
                df.at[idx, "image_url"] = "default.jpeg"
                print(f"{poi_name} not found")
    df.to_csv(CSV_PATH, index=False)
    print("write in CSV")

if __name__ == "__main__":
    main()