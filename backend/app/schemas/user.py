from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3, max_length=50)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None


class UserProfileResponse(BaseModel):
    full_name: str
    email: EmailStr
    age: Optional[int] = None
    gender: Optional[str] = None