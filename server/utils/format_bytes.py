def format_bytes(size_bytes, precision=1):
    """
    Format bytes to human readable format with specified precision
    
    Args:
        size_bytes (int): Size in bytes
        precision (int): Number of decimal places to include
        
    Returns:
        str: Formatted string like '1.2 GB'
    """
    if size_bytes == 0:
        return "0 B"
    
    # Use 1024 for binary units (KiB, MiB, etc.)
    base = 1024
    size_names = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    
    # Calculate the appropriate unit
    i = 0
    while size_bytes >= base and i < len(size_names) - 1:
        size_bytes /= base
        i += 1
    
    # Format with the specified precision
    return f"{size_bytes:.{precision}f} {size_names[i]}"


def main():
    # Example usage
    print(format_bytes(1878453))  # Should output approximately "1.8 MB"
    
    # For exactly 1.2 GB
    gb_1_2 = 1.2 * 1024 * 1024 * 1024  # 1.2 GB in bytes
    print(format_bytes(int(gb_1_2)))  # Should output "1.2 GB"


if __name__ == "__main__":
    main()