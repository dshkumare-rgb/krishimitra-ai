// API Client with Transparent Cache & Offline Fallbacks

// Checks browser online/offline status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Retrieve cached data from LocalStorage
const getCache = (key: string): any => {
  try {
    const data = localStorage.getItem(`km-cache-${key}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error reading cache for ${key}:`, err);
    return null;
  }
};

// Set data in cache
const setCache = (key: string, data: any): void => {
  try {
    localStorage.setItem(`km-cache-${key}`, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing cache for ${key}:`, err);
  }
};

// Queue unsent offline actions (e.g. reporting pests, requesting recommendations)
// and replay them when connection returns
export const queueOfflineAction = (actionName: string, payload: any): void => {
  try {
    const queue = JSON.parse(localStorage.getItem('km-offline-queue') || '[]');
    queue.push({ actionName, payload, timestamp: Date.now() });
    localStorage.setItem('km-offline-queue', JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to queue offline action:', err);
  }
};

// API Client calls wrapper
export const api = {
  get: async (url: string, cacheKey?: string) => {
    // If offline and cacheKey provided, return cached data immediately
    if (!isOnline() && cacheKey) {
      console.log(`🌐 [OFFLINE MODE] Loading cached data for ${cacheKey}`);
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API GET request failed with status: ${response.status}`);
      }
      const data = await response.json();
      
      // Update cache
      if (cacheKey) {
        setCache(cacheKey, data);
      }
      return data;
    } catch (err) {
      console.warn(`Fetch to ${url} failed. Attempting offline fallback cache.`);
      if (cacheKey) {
        const cached = getCache(cacheKey);
        if (cached) return cached;
      }
      throw err;
    }
  },

  post: async (url: string, payload: any, offlineActionName?: string) => {
    if (!isOnline() && offlineActionName) {
      console.log(`🌐 [OFFLINE MODE] Queued action: ${offlineActionName}`);
      queueOfflineAction(offlineActionName, payload);
      return { offline: true, message: 'Request queued. Will submit when back online.' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`API POST request failed with status: ${response.status}`);
    }
    return await response.json();
  },

  upload: async (url: string, formData: FormData) => {
    if (!isOnline()) {
      throw new Error('Image analysis requires an active internet connection.');
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Upload request failed with status: ${response.status}`);
    }
    return await response.json();
  }
};
