from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import user as models
from backend.schemas import user as schemas
from backend.database import get_db

# JWT config
SECRET_KEY = "tmtsk666"
'''
SECRET_KEY 是用來「加密與驗證 JWT token 的簽名」
前端每次帶著 token 回來，後端會用這個 key 來驗證 token 是不是合法
'''
ALGORITHM = "HS256"
'''
JWT 的加密演算法，"HS256"：HMAC-SHA256，是對稱加密方式（用一組密鑰簽名與驗證）
開發階段，使用 "HS256" 是最簡單也最常見的選擇
'''
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
