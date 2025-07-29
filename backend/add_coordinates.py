import csv
import os
import requests
from dotenv import load_dotenv

# 載入 .env 裡的金鑰
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# 讀取原始 CSV 檔案
input_file = "data/poi_taipei.csv"
output_file = "data/poi_taipei_with_coordinates.csv"

def geocode_place(place_name):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": f"{place_name}, Taipei",
        "key": API_KEY,
        "language": "zh-TW"
    }
    response = requests.get(url, params=params)
    result = response.json()

    if result["status"] == "OK":
        address = result["results"][0]["formatted_address"]
        location = result["results"][0]["geometry"]["location"]
        lat = location["lat"]
        lng = location["lng"]
        return address, lat, lng
    else:
        print(f"查詢失敗：{place_name} → {result['status']}")
        return "", "", ""

# 開始處理 CSV
with open(input_file, newline='', encoding='utf-8') as csv_in, \
     open(output_file, "w", newline='', encoding='utf-8') as csv_out:

    reader = csv.DictReader(csv_in)
    fieldnames = reader.fieldnames + ["address", "latitude", "longitude"]
    writer = csv.DictWriter(csv_out, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        name = row["name"]
        print(f"🔍 查詢 {name} 中...")
        address, lat, lng = geocode_place(name)
        row["address"] = address
        row["latitude"] = lat
        row["longitude"] = lng
        writer.writerow(row)

print("Successfully，已補完地址與經緯度，輸出至：", output_file)