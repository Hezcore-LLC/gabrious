import os
import logging
import random
import requests
from typing import Optional, Dict, List, Tuple
from utils.logger import setup_logger

# Set up logger for proxy management
logger = setup_logger('proxy_manager', 'proxy_manager.log')

class ProxyManager:
    """
    Manages proxy connections for YouTube video downloads.
    
    This class provides methods to handle proxy rotation for YouTube authentication,
    helping to bypass bot detection and IP-based restrictions.
    """
    
    def __init__(self, use_free_proxies: bool = True, proxy_api_key: Optional[str] = None):
        """
        Initialize the ProxyManager.
        
        Args:
            use_free_proxies: Whether to use free public proxies (less reliable but no cost)
            proxy_api_key: API key for a premium proxy service (if use_free_proxies is False)
        """
        self.use_free_proxies = use_free_proxies
        self.proxy_api_key = proxy_api_key or os.getenv('PROXY_API_KEY')
        self.proxy_cache = []
        self.last_refresh = 0
        logger.info(f"Proxy manager initialized with use_free_proxies={use_free_proxies}")
    
    def get_proxies(self, count: int = 5, force_refresh: bool = False) -> List[Dict[str, str]]:
        """
        Get a list of proxy servers to try for YouTube downloads.
        
        Args:
            count: Number of proxies to return
            force_refresh: Whether to force a refresh of the proxy cache
            
        Returns:
            A list of proxy dictionaries in the format expected by yt-dlp
        """
        import time
        current_time = time.time()
        
        # Refresh cache if it's empty, expired (older than 30 minutes), or forced
        if (not self.proxy_cache or 
            current_time - self.last_refresh > 1800 or 
            force_refresh):
            
            if self.use_free_proxies:
                self._refresh_free_proxy_list()
            else:
                self._refresh_premium_proxy_list()
            
            self.last_refresh = current_time
        
        # Return requested number of proxies (or all if we have fewer than requested)
        return self.proxy_cache[:min(count, len(self.proxy_cache))]
    
    def _refresh_free_proxy_list(self):
        """
        Refresh the proxy cache with free proxies from public sources.
        """
        try:
            # Clear the current cache
            self.proxy_cache = []
            
            # Try multiple free proxy sources
            sources = [
                self._get_proxies_from_free_proxy_list,
                self._get_proxies_from_proxy_nova,
                self._get_proxies_from_geonode
            ]
            
            for source_func in sources:
                try:
                    proxies = source_func()
                    if proxies:
                        self.proxy_cache.extend(proxies)
                        if len(self.proxy_cache) >= 20:  # Stop if we have enough
                            break
                except Exception as e:
                    logger.warning(f"Error fetching from proxy source: {str(e)}")
                    continue
            
            # Shuffle the proxies to avoid patterns
            random.shuffle(self.proxy_cache)
            
            logger.info(f"Refreshed free proxy list, got {len(self.proxy_cache)} proxies")
        except Exception as e:
            logger.error(f"Failed to refresh free proxy list: {str(e)}")
    
    def _get_proxies_from_free_proxy_list(self) -> List[Dict[str, str]]:
        """
        Get proxies from free-proxy-list.net
        """
        try:
            response = requests.get('https://free-proxy-list.net/', timeout=10)
            if response.status_code != 200:
                return []
                
            import re
            pattern = r'(\d+\.\d+\.\d+\.\d+)\s*</td><td>(\d+)'
            matches = re.findall(pattern, response.text)
            
            proxies = []
            for ip, port in matches:
                proxies.append({
                    'http': f'http://{ip}:{port}',
                    'https': f'http://{ip}:{port}'
                })
            
            return proxies[:10]  # Return up to 10 proxies
        except Exception as e:
            logger.warning(f"Error fetching from free-proxy-list.net: {str(e)}")
            return []
    
    def _get_proxies_from_proxy_nova(self) -> List[Dict[str, str]]:
        """
        Get proxies from proxynova.com
        """
        try:
            response = requests.get('https://www.proxynova.com/proxy-server-list/', timeout=10)
            if response.status_code != 200:
                return []
                
            import re
            pattern = r'data-ip="([^"]+)"[^>]*>\s*([\d\.]+)\s*</abbr></td>\s*<td[^>]*>(\d+)'
            matches = re.findall(pattern, response.text)
            
            proxies = []
            for encoded_ip, visible_ip, port in matches:
                # Use visible_ip if encoded_ip is empty or problematic
                ip = visible_ip if not encoded_ip or 'document.write' in encoded_ip else encoded_ip
                proxies.append({
                    'http': f'http://{ip}:{port}',
                    'https': f'http://{ip}:{port}'
                })
            
            return proxies[:10]  # Return up to 10 proxies
        except Exception as e:
            logger.warning(f"Error fetching from proxynova.com: {str(e)}")
            return []
    
    def _get_proxies_from_geonode(self) -> List[Dict[str, str]]:
        """
        Get proxies from geonode.com API
        """
        try:
            response = requests.get('https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc', timeout=10)
            if response.status_code != 200:
                return []
                
            data = response.json()
            proxies = []
            
            for proxy in data.get('data', []):
                ip = proxy.get('ip')
                port = proxy.get('port')
                if ip and port:
                    proxies.append({
                        'http': f'http://{ip}:{port}',
                        'https': f'http://{ip}:{port}'
                    })
            
            return proxies[:10]  # Return up to 10 proxies
        except Exception as e:
            logger.warning(f"Error fetching from geonode.com: {str(e)}")
            return []
    
    def _refresh_premium_proxy_list(self):
        """
        Refresh the proxy cache with premium proxies from a paid service.
        """
        if not self.proxy_api_key:
            logger.warning("No proxy API key provided for premium proxies")
            # Fall back to free proxies
            self._refresh_free_proxy_list()
            return
            
        try:
            # This is a placeholder for a premium proxy API
            # Replace with actual API call to your preferred proxy provider
            # Example using a fictional proxy service:
            
            # response = requests.get(
            #     f'https://premium-proxy-provider.com/api/v1/proxies?apiKey={self.proxy_api_key}&count=20',
            #     timeout=10
            # )
            # if response.status_code == 200:
            #     data = response.json()
            #     self.proxy_cache = [{
            #         'http': f"http://{proxy['ip']}:{proxy['port']}",
            #         'https': f"http://{proxy['ip']}:{proxy['port']}"
            #     } for proxy in data['proxies']]
            
            # For now, fall back to free proxies
            logger.info("Premium proxy API not implemented, falling back to free proxies")
            self._refresh_free_proxy_list()
            
        except Exception as e:
            logger.error(f"Failed to refresh premium proxy list: {str(e)}")
            # Fall back to free proxies
            self._refresh_free_proxy_list()
    
    def get_yt_dlp_proxy_options(self, count: int = 3) -> List[Dict[str, str]]:
        """
        Get proxy options formatted specifically for yt-dlp.
        
        Args:
            count: Number of proxy options to return
            
        Returns:
            A list of proxy option dictionaries that can be used with yt-dlp
        """
        proxies = self.get_proxies(count=count)
        yt_dlp_options = []
        
        for proxy in proxies:
            # Convert standard proxy dict to yt-dlp format
            # yt-dlp expects 'proxy' parameter with URL
            http_proxy = proxy.get('http', '')
            if http_proxy:
                yt_dlp_options.append({'proxy': http_proxy})
        
        return yt_dlp_options
    
    def test_proxies(self, proxies: List[Dict[str, str]] = None) -> List[Dict[str, str]]:
        """
        Test proxies to ensure they're working and can access YouTube.
        
        Args:
            proxies: List of proxy dictionaries to test, or None to test the cached proxies
            
        Returns:
            List of working proxies
        """
        if proxies is None:
            proxies = self.proxy_cache
            
        working_proxies = []
        
        for proxy in proxies:
            try:
                # Test with a simple request to YouTube
                http_proxy = proxy.get('http')
                if not http_proxy:
                    continue
                    
                response = requests.get(
                    'https://www.youtube.com/robots.txt',
                    proxies=proxy,
                    timeout=5
                )
                
                if response.status_code == 200:
                    working_proxies.append(proxy)
                    logger.info(f"Proxy {http_proxy} is working")
                else:
                    logger.debug(f"Proxy {http_proxy} returned status code {response.status_code}")
            except Exception as e:
                logger.debug(f"Proxy {proxy.get('http', 'unknown')} failed: {str(e)}")
        
        return working_proxies