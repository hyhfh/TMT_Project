import pandas as pd
import os
from serpapi import GoogleSearch

API_KEY = "4bcd846dff043c9a03ea1768995bb6b838d6a736a16fbc4d1969fcbcd748a359"  # <<== 請改成你自己的 SerpAPI API 金鑰
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

# import pandas as pd
# import requests
# import time

# API_KEY = "REDACTED_GOOGLE_KEY"
# SEARCH_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
# DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
# PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo"

# def get_image_url(place_name):
#     # Step 1: 搜尋 place_id
#     search_params = {
#         "input": place_name,
#         "inputtype": "textquery",
#         "fields": "place_id",
#         "key": API_KEY
#     }
#     search_res = requests.get(SEARCH_URL, params=search_params).json()
#     candidates = search_res.get("candidates", [])
#     if not candidates:
#         return None
#     place_id = candidates[0]["place_id"]
#     # Step 2: 拿到照片 reference
#     details_params = {
#         "place_id": place_id,
#         "fields": "photo",
#         "key": API_KEY
#     }
#     details_res = requests.get(DETAILS_URL, params=details_params).json()
#     photos = details_res.get("result", {}).get("photos", [])
#     if not photos:
#         return None
#     photo_ref = photos[0]["photo_reference"]
#     # Step 3: 用 photo reference 取得圖片 URL
#     return f"{PHOTO_URL}?maxwidth=800&photoreference={photo_ref}&key={API_KEY}"

# # Example 用法：處理整個 CSV
# def fill_missing_images(csv_path="data/poi_taipei_tagged.csv", output_path="data/poi_taipei_tagged.csv"):
#     df = pd.read_csv(csv_path)
#     for idx, row in df.iterrows():
#         if pd.isna(row["image_url"]):
#             print(f"Fetching image for: {row['name']}")
#             img_url = get_image_url(row["name"])
#             if img_url:
#                 df.at[idx, "image_url"] = img_url
#             time.sleep(1.2)  # 不要被 Google API 限速擋下
#     df.to_csv(output_path, index=False)
#     return df
    
    
# if __name__ == "__main__":
#     print("📸 正在執行 fetch_image_url.py ...")

#     results = fill_missing_images() 
#     print(f"✅ 總共處理 {len(results)} 筆圖片")

#     # 顯示其中幾筆
#     for r in results[:5]:
#         print(r)