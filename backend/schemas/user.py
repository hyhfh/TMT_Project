from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str

    model_config = ConfigDict(from_attributes=True)
    '''
    為什麼要用 from_attributes=True？
    因為你要讓 Pydantic schema 能夠從 SQLAlchemy 的 ORM 物件中讀取資料。
    這是 Pydantic v2 取代 orm_mode = True 的新作法。
    '''
    # class Config:
    #     orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
