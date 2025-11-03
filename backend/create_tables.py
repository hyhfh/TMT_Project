from sqlalchemy import create_engine
from backend.base import Base
from dotenv import load_dotenv
import os

load_dotenv()  
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

Base.metadata.create_all(engine)
print("Tables created successfully.")