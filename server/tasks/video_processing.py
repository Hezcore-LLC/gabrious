from celery import shared_task
from models import Transcription, StudyNotes, TranscriptionStatus
from celery_app import app as celery_app
from tasks.transcript_processing import process_transcript
import yt_dlp
import os
import subprocess
from openai import AzureOpenAI
from uuid import UUID
from typing import Optional, Dict, List, Tuple
import asyncio
from tortoise import Tortoise
from dotenv import load_dotenv
import logging
import os
import sys
import pathlib
from utils.logger import setup_logger
from utils.cookie_manager import CookieManager
from utils.proxy_manager import ProxyManager

# Set up logger for video processing
logger = setup_logger('video_processing', 'video_processing.log')

# Log startup information
logger.info("Video processing module initialized")

# Load environment variables
load_dotenv()

@shared_task
def process_video(transcription_id: UUID, video_url: str) -> Dict:
    logger.info(f"Starting video processing task for ID: {transcription_id}, URL: {video_url}")
    try:
        result = asyncio.run(_process_video(transcription_id, video_url))
        logger.info(f"Video processing task completed for ID: {transcription_id}")
        return result
    except Exception as e:
        logger.error(f"Video processing task failed for ID: {transcription_id}: {str(e)}", exc_info=True)
        raise

async def _process_video(transcription_id: UUID, video_url: str) -> Dict:
    # Initialize transcription variable outside try block to avoid UnboundLocalError
    transcription = None
    try:
        # Initialize database connection
        await Tortoise.init(
            db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
            modules={'models': ['models']}
        )
        # Get transcription object
        transcription = await Transcription.get(id=transcription_id)
        # Update video URL
        transcription.video_url = video_url
        await transcription.save()
        
        # Update status to downloading
        transcription.status = TranscriptionStatus.DOWNLOADING
        await transcription.save()
        
        # Get temp directory from environment variable or use default paths based on environment
        # In Docker, use /tmp/gabrious which is writable in containers
        # In local development, use a directory in the project folder
        temp_dir = os.getenv('GABRIOUS_TEMP_DIR')
        if not temp_dir:
            # Check if we're in a Docker container by looking for /.dockerenv
            if os.path.exists('/.dockerenv'):
                temp_dir = '/tmp/gabrious'
            else:
                # For local development, use a directory in the project folder
                # Get the project root directory (2 levels up from the current file)
                project_dir = pathlib.Path(__file__).parent.parent
                temp_dir = os.path.join(project_dir, 'temp', 'gabrious')
        
        # Configure yt-dlp with enhanced options for cookie-free authentication
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '32',
            }],
            'outtmpl': os.path.join(temp_dir, f'{transcription_id}.%(ext)s'),
            # Use multiple user agents to avoid detection
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'retries': 10,
            'ignoreerrors': False,  # Don't ignore errors to catch authentication issues
            'nocheckcertificate': True,
            'extract_flat': True,  # Only extract video metadata at first
            'quiet': False,
            'no_warnings': False,
            'verbose': True,  # Enable verbose output for better error tracking
            # Add options to bypass age verification
            'skip_download_archive': True,
            'age_limit': 21,  # Set high age limit to bypass age restrictions
            # Add options to use alternative sources
            'external_downloader_args': ['-4'],  # Force IPv4 which sometimes helps
            'geo_bypass': True,  # Try to bypass geo-restrictions
            'geo_bypass_country': 'US',  # Use US as the geo-bypass country
            # Add options to handle rate limiting
            'sleep_interval': 5,  # Sleep 5 seconds between requests
            'max_sleep_interval': 10,  # Maximum sleep time
            'sleep_interval_requests': 3  # Sleep after every 3 requests
        }
        
        # Ensure temp directory exists
        os.makedirs(temp_dir, exist_ok=True)
        logger.info(f"Using temporary directory: {temp_dir}")

        # Initialize cookie manager for browser cookie extraction
        cookie_manager = CookieManager(temp_dir=os.path.join(temp_dir, 'cookies'))
        logger.info(f"Cookie manager initialized for YouTube authentication")
        
        # Function to try different download methods when the initial attempt fails
        async def try_download_with_fallbacks(video_url, ydl_opts, max_attempts=3):
            logger.info(f"Attempting to download video with fallback methods: {video_url}")
            
            # List of different user agents to try
            user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
            ]
            
            # List of different format options to try
            format_options = [
                'bestaudio/best',
                'bestaudio[ext=m4a]/best[ext=mp4]/best',
                'worstaudio/worst'  # Sometimes lower quality works when higher quality is restricted
            ]
            
            # Get browser options from cookie manager
            browser_options = cookie_manager.get_browser_cookies_options()
            # Extract browser names for logging
            browsers = [option[0] for option in browser_options]
            
            errors = []
            
            # First attempt with original options
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(video_url, download=False)
                    return info, ydl
            except Exception as e:
                errors.append(f"Initial attempt failed: {str(e)}")
            
            # Try with different user agents and format options
            for i in range(max_attempts):
                try:
                    # Create a copy of the original options
                    current_opts = ydl_opts.copy()
                    
                    # Modify with different user agent
                    current_opts['user_agent'] = user_agents[i % len(user_agents)]
                    
                    # Try different format
                    current_opts['format'] = format_options[i % len(format_options)]
                    
                    # Add additional options that might help bypass restrictions
                    if i > 0:
                        current_opts['geo_bypass'] = True
                        current_opts['geo_bypass_country'] = ['US', 'GB', 'CA', 'AU'][i % 4]
                        
                    logger.info(f"Attempt {i+1}: Trying with different configuration")
                    with yt_dlp.YoutubeDL(current_opts) as ydl:
                        info = ydl.extract_info(video_url, download=False)
                        return info, ydl
                except Exception as e:
                    errors.append(f"Attempt {i+1} failed: {str(e)}")
            
            # If standard attempts failed, try with browser cookies as a last resort
            logger.info("Standard download attempts failed, trying with browser cookies")
            
            # Try with cookies from various browsers using the browser options from cookie manager
            for browser_option in browser_options:
                browser_name = browser_option[0]
                try:
                    logger.info(f"Attempting to extract cookies from {browser_name}")
                    cookie_opts = ydl_opts.copy()
                    cookie_opts['cookiesfrombrowser'] = browser_option  # (browser_name, profile_path, keyring, container)
                    
                    with yt_dlp.YoutubeDL(cookie_opts) as ydl:
                        logger.info(f"Extracting info with cookies from {browser_name}")
                        info = ydl.extract_info(video_url, download=False)
                        logger.info(f"Successfully extracted info using cookies from {browser_name}")
                        return info, ydl
                except Exception as e:
                    error_msg = str(e)
                    logger.warning(f"Failed to use cookies from {browser_name}: {error_msg}")
                    errors.append(f"Cookie attempt with {browser_name} failed: {error_msg}")
                    
                    # If the error indicates a missing browser, continue to the next one
                    if "browser is not installed" in error_msg.lower() or "browser not found" in error_msg.lower():
                        logger.info(f"Browser {browser_name} not installed, trying next browser")
                        continue
            
            # If cookie-based attempts failed, try with proxy rotation as a last resort
            logger.info("Cookie-based attempts failed, trying with proxy rotation")
            
            # Initialize proxy manager
            proxy_manager = ProxyManager()
            proxy_options = proxy_manager.get_yt_dlp_proxy_options(count=5)
            
            # Try with different proxies
            for i, proxy_opt in enumerate(proxy_options):
                try:
                    logger.info(f"Attempting download with proxy {i+1}/{len(proxy_options)}")
                    proxy_opts = ydl_opts.copy()
                    
                    # Add proxy to options
                    proxy_opts['proxy'] = proxy_opt.get('proxy')
                    
                    # Try with different user agent and format for each proxy
                    proxy_opts['user_agent'] = user_agents[i % len(user_agents)]
                    proxy_opts['format'] = format_options[i % len(format_options)]
                    
                    with yt_dlp.YoutubeDL(proxy_opts) as ydl:
                        logger.info(f"Extracting info with proxy {proxy_opt.get('proxy')}")
                        info = ydl.extract_info(video_url, download=False)
                        logger.info(f"Successfully extracted info using proxy")
                        return info, ydl
                except Exception as e:
                    error_msg = str(e)
                    logger.warning(f"Failed to use proxy {proxy_opt.get('proxy')}: {error_msg}")
                    errors.append(f"Proxy attempt {i+1} failed: {error_msg}")
            
            # If all attempts failed, raise the last error
            error_msg = "\n".join(errors)
            logger.error(f"All download attempts failed (including cookie-based and proxy attempts):\n{error_msg}")
            raise yt_dlp.utils.DownloadError(f"Failed to download after multiple attempts: {errors[-1]}")
        
        # Extract video metadata and download using fallback methods
        try:
            logger.info(f"Extracting metadata for video: {video_url}")
            info, ydl = await try_download_with_fallbacks(transcription.video_url, ydl_opts)
            
            # Extract all metadata directly
            # Title extraction
            transcription.title = info.get('title')
            
            # Pastor/uploader extraction with fallbacks in a single line
            transcription.pastor = info.get('uploader') or info.get('channel') or info.get('creator') or info.get('artist')
            
            # Thumbnail extraction with fallbacks
            transcription.thumbnail = info.get('thumbnail')
            if not transcription.thumbnail and 'thumbnails' in info and info['thumbnails']:
                thumbnails = info['thumbnails']
                if thumbnails:
                    # Get the highest quality thumbnail (usually the last one)
                    transcription.thumbnail = thumbnails[-1].get('url')
            
            # Duration formatting
            duration_seconds = info.get('duration')
            if duration_seconds:
                minutes, seconds = divmod(duration_seconds, 60)
                hours, minutes = divmod(minutes, 60)
                transcription.duration = f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}" if hours > 0 else f"{int(minutes):02d}:{int(seconds):02d}"
            else:
                transcription.duration = None
            
            # Make sure to save all metadata before proceeding
            await transcription.save()
            
            # Now download the video
            logger.info(f"Downloading video: {video_url}")
            ydl.download([transcription.video_url])
        except Exception as e:
            logger.error(f"Error during video download with fallbacks: {str(e)}")
            raise
        
        # Update status to extracting audio
        transcription.status = TranscriptionStatus.EXTRACTING_AUDIO
        await transcription.save()
        
        # Further reduce file size by converting to mono and lower bitrate
        original_file = os.path.join(temp_dir, f'{transcription_id}.mp3')
        optimized_file = os.path.join(temp_dir, f'{transcription_id}_optimized.mp3')
        
        logger.info(f"Optimizing audio file")
        # Use FFmpeg to convert to mono with 16kHz sample rate and 24kbps bitrate
        subprocess.run([
            'ffmpeg', '-y', '-i', original_file,
            '-ac', '1',  # Mono audio (1 channel)
            '-ar', '16000',  # 16kHz sample rate
            '-b:a', '24k',  # 24kbps bitrate
            optimized_file
        ], check=True)
        
        # Replace original with optimized version
        os.remove(original_file)
        os.rename(optimized_file, original_file)
        
        # Calculate and store file size
        file_size = os.path.getsize(original_file)
        transcription.file_size = file_size
        await transcription.save()
        
        # Configure Azure OpenAI client
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version="2024-02-01",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        
        # Update status to transcribing
        transcription.status = TranscriptionStatus.TRANSCRIBING
        await transcription.save()
        
        # Perform transcription using Azure OpenAI
        deployment_id = os.getenv("AZURE_OPENAI_DEPLOYMENT_ID", "whisper")
        
        logger.info(f"Transcribing audio using Azure OpenAI")
        with open(os.path.join(temp_dir, f'{transcription_id}.mp3'), "rb") as audio_file:
            result = client.audio.transcriptions.create(
                file=audio_file,
                model=deployment_id  # Use the deployment_id instead of hardcoded "whisper"
            )
        
        # Save transcription text
        transcription.transcription_text = result.text
        transcription.status = TranscriptionStatus.GENERATING_NOTES
        await transcription.save()
        
        # Clean up temporary files
        logger.info(f"Cleaning up temporary files")
        os.remove(os.path.join(temp_dir, f'{transcription_id}.mp3'))
        
        # Generate study notes using transcript processing
        logger.info(f"Initiating study notes generation via transcript processing")
        process_transcript.delay(str(transcription.id))
        
        # Status will be updated by transcript processing task
        logger.info(f"Study notes generation task queued")
        
        logger.info(f"Video processing completed successfully for ID: {transcription_id}")
        return {"status": "success", "transcription_id": str(transcription_id)}
        
    except yt_dlp.utils.DownloadError as e:
        error_message = str(e)
        logger.error(f"YouTube download error: {error_message}", exc_info=True)
        
        # Improved error handling for various authentication issues
        if any(msg in error_message for msg in [
            'Sign in to confirm you\'re not a bot', 
            'This video is private',
            'This video requires payment',
            'This video is only available to Music Premium members',
            'Please sign in to view this video',
            'Video unavailable',
            'Private video',
            'Login required'
        ]):
            error_message = "This video requires authentication or is private. Please try a different video or one that is publicly available."
        
        if transcription:
            transcription.status = TranscriptionStatus.FAILED
            transcription.error_message = error_message
            await transcription.save()
        raise
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}", exc_info=True)
        if transcription:
            transcription.status = TranscriptionStatus.FAILED
            transcription.error_message = str(e)
            await transcription.save()
        raise
    finally:
        # Ensure database connections are properly closed
        await Tortoise.close_connections()