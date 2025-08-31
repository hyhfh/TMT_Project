from urllib.parse import quote_plus

def generate_map_url(name: str) -> str:
    return f"https://www.google.com/maps/search/{quote_plus(name + ' 台北市')}"