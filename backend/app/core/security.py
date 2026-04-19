from datetime import datetime, timedelta
from typing import Any
from jose import jwt, JWTError
from app.core.config import get_settings

settings = get_settings()
ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    payload = {"sub": str(subject), "exp": expire, "iat": datetime.utcnow()}
    return jwt.encode(payload, settings.APP_SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.APP_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return {}
