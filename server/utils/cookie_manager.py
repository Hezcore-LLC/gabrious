import os
import logging
import pathlib
from typing import Optional, Dict, Tuple, List
import json
import tempfile
from utils.logger import setup_logger

# Set up logger for cookie management
logger = setup_logger('cookie_manager', 'cookie_manager.log')

class CookieManager:
    """Manages browser cookies for YouTube authentication.
    
    This class provides methods to handle browser cookies for YouTube authentication,
    including creating temporary cookie files and cleaning them up after use.
    """
    
    def __init__(self, temp_dir: Optional[str] = None):
        """Initialize the CookieManager.
        
        Args:
            temp_dir: Optional directory to store temporary cookie files.
                     If None, system temp directory will be used.
        """
        self.temp_dir = temp_dir
        if not self.temp_dir:
            # Check if we're in a Docker container
            if os.path.exists('/.dockerenv'):
                self.temp_dir = '/tmp/gabrious/cookies'
            else:
                # For local development, use a directory in the project folder
                project_dir = pathlib.Path(__file__).parent.parent
                self.temp_dir = os.path.join(project_dir, 'temp', 'gabrious', 'cookies')
        
        # Ensure the temp directory exists
        os.makedirs(self.temp_dir, exist_ok=True)
        logger.info(f"Cookie manager initialized with temp directory: {self.temp_dir}")
    
    def get_browser_cookies_options(self) -> List[Tuple[str, Optional[str], Optional[str], Optional[str]]]:
        """Get a list of browser cookie options to try for YouTube authentication.
        
        Returns:
            A list of tuples in the format (browser_name, profile_path, keyring, container)
            that can be used with yt-dlp's cookiesfrombrowser option.
        """
        # List of browsers to try for cookies extraction
        # Format: (browser_name, profile_path, keyring, container)
        # None values mean use default paths
        return [
            ('chrome', None, None, None),
            ('firefox', None, None, None),
            ('edge', None, None, None),
            ('safari', None, None, None),
            ('opera', None, None, None),
            ('brave', None, None, None),
            ('chromium', None, None, None),
            ('vivaldi', None, None, None)
        ]
    
    def cleanup(self) -> None:
        """Clean up any temporary cookie files created during the download process."""
        try:
            # Implement cleanup logic if needed
            # For now, we're using yt-dlp's built-in cookie handling which doesn't create files
            pass
        except Exception as e:
            logger.error(f"Error cleaning up cookie files: {str(e)}")