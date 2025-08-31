# TailorMyTaipei: AI-Powered Personalised Travel Itinerary Planning for Taipei

## Overview
TailorMyTaipei is a web-based travel itinerary planner designed for travellers visiting Taipei.  
It combines curated Points of Interest (POI) data, contextual information (weather and maps), and an AI-powered recommendation engine to generate personalised itineraries.  
The system was developed as part of the MSc Computer Science Project at the University of Birmingham (2024–2025).

## Features
- **Personalised Itinerary Generation**  
  Generate day-by-day itineraries based on user preferences (dates, interests, free-text input).
- **AI Integration**  
  LLM (Llama-3 via Ollama + LangChain integration) produces itinerary + rationale.
- **Contextual Information**  
  Real-time weather forecasts and Google Maps embedding/links for each POI.
- **Explore Page**  
  Browse POIs with images, descriptions, and details.
- **My Trips**  
  Save, view, and delete itineraries.
- **Top Recommendations**  
  View popular Taipei POIs sorted by popularity.

## System Architecture
- **Frontend**: Next.js (React) + Tailwind CSS  
- **Backend**: FastAPI (Python)  
- **Database**: PostgreSQL (with SQLAlchemy ORM)  
- **AI**: Ollama (local Llama-3) + `langchain-ollama`  
- **External APIs**:  
  - OpenWeatherMap API (weather)  
  - Google Maps (map embedding & links)  
- **Data Sources**: Curated CSV/DB of Taipei POIs, enriched with metadata (tags, ideal time, popularity)

---

## Installation

### Prerequisites
- Python 3.9+
- Node.js (LTS version, e.g. 18 or 20)
- PostgreSQL
- Ollama installed and running locally
- OpenWeatherMap API key

### Backend Setup
```bash
# 0) (recommended) create a virtual env at project root
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip

# 1) install Python dependencies
pip install -r requirements.txt

# 2) start Ollama (required for LLM)
ollama serve
# first time only:
ollama pull llama3

# 3) create database (choose one)
createdb tailormytaipei
# or via psql:
psql -U postgres -c "CREATE DATABASE tailormytaipei;"

# 4) create tables & load data
python backend/create_tables.py
python backend/import_poi.py
python backend/import_poi_with_coordinates.py
python backend/import_popularity.py

# 5) run API
uvicorn backend.main:app --reload
# backend available at http://127.0.0.1:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

---

## Environment Variables

### Backend (`.env` at project root)
```dotenv
# Database
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@localhost:5432/tailormytaipei

# Weather
WEATHER_API_KEY=your_openweather_key 

# Google Maps
GOOGLE_MAPS_API_KEY=your_googlemaps_key

---

## Usage
1. Open frontend: http://localhost:3000  
2. Submit preferences (dates, interests, free-text) to generate itineraries.  
3. Explore POIs via **Explore** and manage saved trips via **My Trips**.

---

## Project Structure
```bash
PROJECT_HUA/
├─ backend/
│  ├─ main.py                                        # FastAPI entry
│  ├─ recommendation/
│  │  └─ recommend_itinerary.py         # Core recommendation logic
│  ├─ routers/                                         # API routes
│  │  └─ recommendation.py                # /recommend_itinerary endpoint
│  ├─ schemas/                                      # Pydantic schemas
│  ├─ database.py
│  ├─ db_models.py                               # SQLAlchemy models
│  ├─ create_tables.py
│  ├─ import_poi.py
│  ├─ import_poi_with_coordinates.py
│  ├─ import_popularity.py
│  └─ data/
│     ├─ poi_taipei_tagged.csv
│     └─ poi_for_llm.csv
├─ frontend/
│  ├─ pages/                     			# index.js, itinerary.js, explore.js, my-trips.js, poi/[id].js ...
│  ├─ components/                			# POICard, Navbar, WeatherBox, ...
│  └─ styles/
├─ .env                          				# backend env
├─ requirements.txt        			        # Python deps
└─ README.md
```

---

## Data Sources
- Taipei Travel Open Data  
- Taipei City Open Data  
- Curated dataset (`poi_taipei_tagged.csv`, `poi_for_llm.csv`) with POI metadata (tags, ideal time, popularity)

---

## Acknowledgements
- Supervisor: Dr Michael Oakes, University of Birmingham  
- Inspector: Dr Vincent Rahli, University of Birmingham  
- Libraries & APIs: FastAPI, Next.js, Tailwind, SQLAlchemy, Ollama, LangChain, OpenWeatherMap, Google Maps  

This project was developed as part of the MSc Computer Science dissertation at the University of Birmingham (2024–2025).