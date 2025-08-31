from sqlalchemy import create_engine
from backend.base import Base

engine = create_engine("postgresql://REDACTED@localhost:5432/tailor_taipei")

Base.metadata.create_all(engine)
print("Tables created successfully.")