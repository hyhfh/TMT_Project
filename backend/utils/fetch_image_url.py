import pandas as pd
import os
from serpapi import GoogleSearch
from dotenv import load_dotenv

# API_KEY = ""  # <<== 請改成你自己的 SerpAPI API 金鑰
load_dotenv()  # 載入.env檔案
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
    print("📸 正在從 Google 搜尋圖片中 ...")
    df = pd.read_csv(CSV_PATH)
    for idx, row in df.iterrows():
        if pd.isna(row["image_url"]) or row["image_url"] == "":
            poi_name = row["name"]
            image_url = search_google_image(f"{poi_name} Taipei")
            if image_url:
                df.at[idx, "image_url"] = image_url
                print(f"✅ {poi_name} 圖片已取得")
            else:
                df.at[idx, "image_url"] = "default.jpeg"
                print(f"⚠️ {poi_name} 找不到圖片，使用預設圖")
    df.to_csv(CSV_PATH, index=False)
    print("✅ 所有圖片網址已寫入 CSV")

if __name__ == "__main__":
    main()