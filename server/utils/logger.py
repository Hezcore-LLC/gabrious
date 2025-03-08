import logging
import os
import sys
from typing import Optional

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(logs_dir, exist_ok=True)


def setup_logger(name: str, log_file: Optional[str] = None, level=logging.INFO) -> logging.Logger:
    """
    Set up a logger with both file and console handlers.
    
    Args:
        name: The name of the logger
        log_file: The name of the log file (without path). If None, uses name.log
        level: The logging level
        
    Returns:
        A configured logger instance
    """
    # Use provided log_file or default to name.log
    if log_file is None:
        log_file = f"{name}.log"
    
    log_file_path = os.path.abspath(os.path.join(logs_dir, log_file))
    
    # Get or create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remove any existing handlers to avoid duplicates when module is reloaded
    if logger.hasHandlers():
        logger.handlers.clear()
    
    # Create file handler with immediate flush
    file_handler = logging.FileHandler(log_file_path, mode='a')
    file_handler.setLevel(level)
    file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_formatter)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    # Prevent logs from propagating to the root logger
    logger.propagate = False
    
    return logger


# Create a default application logger
app_logger = setup_logger('gabrious', 'app.log')