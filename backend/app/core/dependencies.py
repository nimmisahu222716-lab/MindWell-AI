print("DEPENDENCIES.PY LOADED")
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.core.config import JWT_SECRET

ALGORITHM = "HS256"

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    print("=" * 50)
    print("TOKEN:", token)
    print("JWT_SECRET:", JWT_SECRET)

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])

        print("PAYLOAD:", payload)

        email = payload.get("email")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return email

    except JWTError as e:
        print("JWT ERROR:", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )