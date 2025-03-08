from fastapi import APIRouter, Depends, HTTPException
from models.user import User
from api.auth import get_current_user
from services.storage import StorageService

router = APIRouter()

@router.get("/usage")
async def get_storage_usage(current_user: User = Depends(get_current_user)):
    """Get storage usage statistics for the current user"""
    stats = await StorageService.get_storage_stats(str(current_user.id))
    
    # Convert bytes to more readable format
    stats["used_formatted"] = format_bytes(stats["used"])
    stats["total_formatted"] = format_bytes(stats["total"])
    
    return stats

@router.get("/check-limit")
async def check_storage_limit(file_size: int, current_user: User = Depends(get_current_user)):
    """Check if user has enough storage space for a file of given size"""
    has_space = await StorageService.check_storage_limit(str(current_user.id), file_size)
    
    if not has_space:
        raise HTTPException(
            status_code=400, 
            detail="Storage limit exceeded. Please upgrade your plan or delete some content."
        )
    
    return {"has_space": True}

def format_bytes(size_bytes):
    """Format bytes to human readable format"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ("B", "KB", "MB", "GB", "TB")
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.2f} {size_names[i]}"