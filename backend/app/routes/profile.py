from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.database import users_collection
from app.core.dependencies import get_current_user
from app.schemas.user import (
    UserProfileUpdate,
    UserProfileResponse
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/", response_model=UserProfileResponse)
def get_profile(
    current_user: str = Depends(get_current_user)
):

    user = users_collection.find_one(
        {"email": current_user},
        {"_id": 0, "password": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.put("/")
def update_profile(
    data: UserProfileUpdate,
    current_user: str = Depends(get_current_user)
):

    update_data = data.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided"
        )

    update_data["updated_at"] = datetime.now(timezone.utc)

    users_collection.update_one(
        {"email": current_user},
        {"$set": update_data}
    )

    return {
        "message": "Profile updated successfully"
    }