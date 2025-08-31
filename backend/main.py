from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import user, trip, poi, recommendation, explain
from backend.database import engine 
from backend.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(trip.router)
app.include_router(poi.router)
app.include_router(recommendation.router)
app.include_router(explain.router)