from fastapi import Depends
from app.core.dependencies import get_current_user
from app.schemas.user import UserProfileUpdate
from fastapi import APIRouter, HTTPException
from app.schemas.user import  UserLogin
from app.core.database import users_collection

import random

from datetime import datetime, timedelta

from app.utils.email_service import send_otp_email
from app.core.database import otp_collection


from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.schemas.auth import (
    SendOTPRequest,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp")
def send_signup_otp(user: SendOTPRequest):

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    otp = str(random.randint(100000, 999999))

    otp_collection.delete_many(
        {"email": user.email}
    )

    otp_collection.insert_one(
        {
            "type": "signup",
            "full_name": user.full_name,
            "email": user.email,
            "password": hash_password(user.password),
            "otp": otp,
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "created_at": datetime.utcnow()
        }
    )

    send_otp_email(user.email, otp)

    return {
        "message": "OTP sent successfully. Please verify your email."
    }


@router.post("/verify-otp")
def verify_signup_otp(data: VerifyOTPRequest):

    otp_data = otp_collection.find_one(
        {
            "email": data.email,
            "otp": data.otp,
            "type": "signup"
        }
    )

    if not otp_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if datetime.utcnow() > otp_data["expires_at"]:
        otp_collection.delete_one({"_id": otp_data["_id"]})
        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )

    users_collection.insert_one(
        {
            "full_name": otp_data["full_name"],
            "email": otp_data["email"],
            "password": otp_data["password"],
            "age": None,
            "gender": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )

    otp_collection.delete_one({"_id": otp_data["_id"]})

    return {
        "message": "Email verified successfully. Account created."
    }


@router.post("/login")
def login(user: UserLogin):

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "email": existing_user["email"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):

    user = users_collection.find_one(
        {"email": data.email}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not registered"
        )

    otp = str(random.randint(100000, 999999))

    otp_collection.delete_many(
        {
            "email": data.email,
            "type": "reset"
        }
    )

    otp_collection.insert_one(
        {
            "type": "reset",
            "email": data.email,
            "otp": otp,
            "verified": False,
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "created_at": datetime.utcnow()
        }
    )

    send_otp_email(data.email, otp)

    return {
        "message": "Password reset OTP sent successfully."
    }

@router.post("/verify-reset-otp")
def verify_reset_otp(data: VerifyOTPRequest):

    otp_data = otp_collection.find_one(
        {
            "email": data.email,
            "otp": data.otp,
            "type": "reset"
        }
    )

    if not otp_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if datetime.utcnow() > otp_data["expires_at"]:
        otp_collection.delete_one({"_id": otp_data["_id"]})
        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )

    otp_collection.update_one(
        {"_id": otp_data["_id"]},
        {
            "$set": {
                "verified": True
            }
        }
    )

    return {
        "message": "OTP verified successfully."
    }
    
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):

    otp_data = otp_collection.find_one(
        {
            "email": data.email,
            "type": "reset",
            "verified": True
        }
    )

    if not otp_data:
        raise HTTPException(
            status_code=400,
            detail="Please verify your OTP first."
        )

    users_collection.update_one(
        {
            "email": data.email
        },
        {
            "$set": {
                "password": hash_password(data.new_password),
                "updated_at": datetime.utcnow()
            }
        }
    )

    otp_collection.delete_one(
        {
            "_id": otp_data["_id"]
        }
    )

    return {
        "message": "Password reset successfully."
    }