from sqlalchemy import create_engine
# from db_models import Base
# from backend.database import Base
from backend.base import Base

# 自己的 PostgreSQL 連線字串
engine = create_engine("postgresql://REDACTED@localhost:5432/tailor_taipei")

# 創建所有定義過的表格
Base.metadata.create_all(engine)
print("Tables created successfully.")