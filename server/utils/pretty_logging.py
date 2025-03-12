import logging
import os
import sys
import datetime
import re
from typing import Optional
from termcolor import colored
import pygments
from pygments.lexers import SqlLexer
from pygments.formatters import TerminalFormatter, Terminal256Formatter, TerminalTrueColorFormatter
import platform

# ANSI color codes for terminal output
COLORS = {
    'RESET': '\033[0m',
    'BOLD': '\033[1m',
    'RED': '\033[31m',
    'GREEN': '\033[32m',
    'YELLOW': '\033[33m',
    'BLUE': '\033[34m',
    'MAGENTA': '\033[35m',
    'CYAN': '\033[36m',
    'WHITE': '\033[37m',
    'GRAY': '\033[90m',
    'BRIGHT_RED': '\033[91m',
    'BRIGHT_GREEN': '\033[92m',
    'BRIGHT_YELLOW': '\033[93m',
    'BRIGHT_BLUE': '\033[94m',
    'BRIGHT_MAGENTA': '\033[95m',
    'BRIGHT_CYAN': '\033[96m',
    'BRIGHT_WHITE': '\033[97m',
}

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(logs_dir, exist_ok=True)


class PrettyFormatter(logging.Formatter):
    """Custom formatter for prettier logs with colors and SQL highlighting"""
    
    def __init__(self, fmt=None, datefmt=None, style='%', use_colors=True):
        super().__init__(fmt, datefmt, style)
        # Force colors on by default, but respect explicit setting
        self.use_colors = self._detect_color_support() if use_colors else False
        self.sql_lexer = SqlLexer()
        
        # Use the best formatter available for the terminal
        if os.environ.get('COLORTERM', '') in ('truecolor', '24bit'):
            self.terminal_formatter = TerminalTrueColorFormatter(style='monokai')
        elif '256' in os.environ.get('TERM', ''):
            self.terminal_formatter = Terminal256Formatter(style='monokai')
        else:
            self.terminal_formatter = TerminalFormatter(bg='dark')
            
    def _detect_color_support(self):
        """Detect if the terminal supports colors"""
        # Check if colors are explicitly disabled
        if os.environ.get('NO_COLOR') is not None:
            return False
            
        # Check if we're in a known color-supporting terminal
        if os.environ.get('TERM') in ('xterm', 'xterm-color', 'xterm-256color', 'linux', 
                                     'screen', 'screen-256color', 'vt100', 'rxvt'):
            return True
            
        # Check for Windows terminal support
        if platform.system() == 'Windows':
            # Windows 10 build 14931+ supports ANSI colors
            try:
                import ctypes
                kernel32 = ctypes.windll.kernel32
                # Check if ENABLE_VIRTUAL_TERMINAL_PROCESSING (0x0004) is supported
                return kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 0x0004)
            except (ImportError, AttributeError):
                # If we can't check, assume no color support
                return False
                
        # Check if output is a TTY
        return hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()
    
    def format(self, record):
        # Get the original formatted message
        msg = super().format(record)
        
        if not self.use_colors:
            return msg
        
        # Add colors based on log level
        if record.levelno >= logging.ERROR:
            level_color = COLORS['RED']
        elif record.levelno >= logging.WARNING:
            level_color = COLORS['YELLOW']
        elif record.levelno >= logging.INFO:
            level_color = COLORS['GREEN']
        else:
            level_color = COLORS['GRAY']
        
        # Format timestamp
        timestamp = datetime.datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        colored_timestamp = f"{COLORS['GRAY']}{timestamp}{COLORS['RESET']}"
        
        # Format logger name
        colored_logger = f"{COLORS['CYAN']}{record.name}{COLORS['RESET']}"
        
        # Format level name
        colored_level = f"{level_color}{record.levelname}{COLORS['RESET']}"
        
        # Check if the message contains SQL and highlight it
        message = record.getMessage()
        
        # More comprehensive SQL pattern detection
        sql_keywords = (
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE',
            'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'BEGIN', 'WITH', 'UNION', 'JOIN',
            'WHERE', 'FROM', 'INTO', 'VALUES', 'TABLE', 'INDEX', 'VIEW', 'FUNCTION', 'PROCEDURE'
        )
        
        # Check if any SQL keyword is in the message
        if any(keyword in message.upper() for keyword in sql_keywords):
            # Extract SQL query - improved pattern to catch more SQL statements
            sql_pattern = r'\b(' + '|'.join(sql_keywords) + r')\b[\s\S]*?;'
            sql_matches = re.findall(sql_pattern, message, re.IGNORECASE)
            
            if sql_matches:
                for sql in sql_matches:
                    # Get the full SQL statement
                    start_idx = message.upper().find(sql.upper())
                    if start_idx >= 0:
                        # Find the end of the statement (next semicolon)
                        end_idx = message.find(';', start_idx) + 1
                        if end_idx > 0:
                            full_sql = message[start_idx:end_idx]
                            # Apply syntax highlighting with proper terminal formatting
                            highlighted_sql = pygments.highlight(
                                full_sql,
                                self.sql_lexer,
                                self.terminal_formatter
                            ).rstrip()
                            # Ensure proper line breaks and indentation
                            formatted_sql = f"\n{COLORS['BRIGHT_CYAN']}SQL Query:{COLORS['RESET']}\n  {highlighted_sql.replace('\n', r'\n  ')}\n"
                            message = message.replace(full_sql, formatted_sql)
        
        # Format the final message with proper spacing
        return f"{colored_timestamp} | {colored_logger} | {colored_level} | {message}"


def setup_pretty_logger(name: str, log_file: Optional[str] = None, level=logging.INFO) -> logging.Logger:
    """
    Set up a logger with both file and console handlers using pretty formatting.
    
    Args:
        name: The name of the logger
        log_file: The name of the log file (without path). If None, uses name.log
        level: The logging level
        
    Returns:
        A configured logger instance with pretty formatting
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
    
    # Create file handler with standard formatting (no colors in files)
    file_handler = logging.FileHandler(log_file_path, mode='a')
    file_handler.setLevel(level)
    file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_formatter)
    
    # Create console handler with pretty formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = PrettyFormatter()
    console_handler.setFormatter(console_formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    # Prevent logs from propagating to the root logger
    logger.propagate = False
    
    return logger


# Configure SQL query logging for Tortoise ORM
def setup_tortoise_sql_logging(level=logging.DEBUG):
    """
    Set up SQL query logging for Tortoise ORM with pretty formatting
    
    Args:
        level: The logging level for SQL queries
    """
    tortoise_logger = setup_pretty_logger('tortoise.db.query', 'sql.log', level)
    return tortoise_logger


# Create a default application logger with pretty formatting
app_logger = setup_pretty_logger('gabrious', 'app.log')