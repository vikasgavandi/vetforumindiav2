
// centralized API configuration
// Logic:
// If hostname is localhost or local IP (192.168.x.x, 10.x.x.x, 172.x.x.x), use local backend port 4000
// Otherwise, use production URL

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Support for temporary Cloudflare Tunnels, ngrok, or localtunnel
  if (hostname.endsWith('trycloudflare.com') || hostname.endsWith('.ngrok-free.app') || hostname.endsWith('.localtunnel.me')) {
    return '/api/vetforumindia/v1';
  }

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    const apiHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
    return `http://${apiHost}:4000/api/vetforumindia/v1`;
  }
  
  return 'https://vetforumindia.com/api/vetforumindia/v1';
};

export const API_BASE_URL = getApiBaseUrl();
