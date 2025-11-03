from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from models.user import User, FaithContext
from api.auth import get_current_user
from typing import Optional

router = APIRouter()

class ProfileResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    faith_context: str
    preferred_depth_mode: str
    is_verified: bool
    created_at: str

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PreferencesUpdate(BaseModel):
    faith_context: Optional[FaithContext] = None
    preferred_depth_mode: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/me", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "faith_context": current_user.faith_context,
        "preferred_depth_mode": current_user.preferred_depth_mode,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat()
    }

@router.put("/me", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user profile information"""
    # Check if email is being changed and if it's already taken
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = await User.get_or_none(email=profile_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = profile_data.email
    
    # Update other fields if provided
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    
    await current_user.save()
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "faith_context": current_user.faith_context,
        "preferred_depth_mode": current_user.preferred_depth_mode,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat()
    }

@router.put("/preferences", response_model=ProfileResponse)
async def update_preferences(
    preferences: PreferencesUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user preferences (faith context and depth mode)"""
    if preferences.faith_context is not None:
        current_user.faith_context = preferences.faith_context
    
    if preferences.preferred_depth_mode is not None:
        # Validate depth mode
        valid_modes = ["beginner", "intermediate", "advanced", "scholar"]
        if preferences.preferred_depth_mode not in valid_modes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid depth mode. Must be one of: {', '.join(valid_modes)}"
            )
        current_user.preferred_depth_mode = preferences.preferred_depth_mode
    
    await current_user.save()
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "faith_context": current_user.faith_context,
        "preferred_depth_mode": current_user.preferred_depth_mode,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat()
    }

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    # Verify current password
    if not current_user.verify_password(password_data.current_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long"
        )
    
    # Set new password
    current_user.set_password(password_data.new_password)
    await current_user.save()
    
    return {"message": "Password changed successfully"}

@router.delete("/me")
async def delete_account(current_user: User = Depends(get_current_user)):
    """Delete user account (soft delete by deactivating)"""
    current_user.is_active = False
    await current_user.save()
    
    return {"message": "Account deactivated successfully"}
