// Resolve the API Base URL dynamically
const getInitialApiBase = (): string => {
  // Check if we are running in Electron
  const isElectron = typeof window !== 'undefined' && 
    (window.navigator.userAgent.toLowerCase().includes('electron') || (window as any).electronAPI);

  if (isElectron && (window as any).electronAPI?.getBackendPortSync) {
    try {
      // Synchronously retrieve the port Electron started the backend on
      const port = (window as any).electronAPI.getBackendPortSync();
      if (port) {
        return `http://127.0.0.1:${port}`;
      }
    } catch (err) {
      console.error("Failed to get backend port synchronously from Electron:", err);
    }
  }

  // Fallback to custom user override from localStorage (e.g. for testing cloud URL)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('PL_HUMANIZER_API_URL');
    if (saved) return saved;
  }

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('backendUrl');
      if (urlParam) {
        return urlParam;
      }
    }
    if (import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Deployed fallback (relative path using current origin)
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1' && 
        window.location.hostname !== '::1') {
      return window.location.origin;
    }
    return "http://127.0.0.1:5000";
  };

  return getApiBaseUrl();
};

// Use ESM live bindings to allow updating the API_BASE_URL dynamically at runtime
export let API_BASE_URL = getInitialApiBase();

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
  if (typeof window !== 'undefined') {
    localStorage.setItem('PL_HUMANIZER_API_URL', url);
  }
}
