FROM python:3.12-slim

WORKDIR /app

# Install system dependencies including FFmpeg with enhanced MP3 support
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libmp3lame0 \
    libavcodec-extra \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apt/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/temp /app/logs

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]