# YouTube Cookie Authentication

## Overview

This document explains how the Gabrious application handles YouTube authentication using browser cookies to bypass bot detection.

## How It Works

When downloading videos from YouTube, the application may encounter bot detection mechanisms that require authentication. To handle this, we've implemented a robust cookie handling system that:

1. First attempts to download videos without authentication
2. If that fails, tries different user agents and format options
3. As a last resort, extracts cookies from installed browsers on the host machine

## Cookie Manager

The `CookieManager` class in `utils/cookie_manager.py` provides methods to handle browser cookies for YouTube authentication. It:

- Creates a temporary directory for cookie storage
- Provides a list of browser options to try for cookie extraction
- Works in both local development and Docker environments

## Supported Browsers

The system attempts to extract cookies from the following browsers (if installed):

- Chrome
- Firefox
- Edge
- Safari
- Opera
- Brave
- Chromium
- Vivaldi

## Troubleshooting

If you encounter YouTube authentication issues:

1. Ensure at least one of the supported browsers is installed on the host machine
2. Make sure you're logged into YouTube in at least one browser
3. Check the logs for specific error messages related to cookie extraction
4. For Docker deployments, ensure the container has access to browser cookie files

## Security Considerations

The cookie extraction mechanism uses yt-dlp's built-in `cookiesfrombrowser` option, which securely extracts cookies without storing them as files. This approach is more secure than exporting cookies to files.

## References

- [yt-dlp FAQ on cookies](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp)
- [yt-dlp Extractors - Exporting YouTube cookies](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)