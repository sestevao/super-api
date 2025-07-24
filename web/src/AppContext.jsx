import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AppContext = createContext();

// Cache configuration
const CACHE_VERSION = '1.0';
const CACHE_MAX_AGE = 1000 * 60 * 30; // 30 minutes
const CACHE_MAX_ITEMS = 50;

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Enhanced cache with versioning, TTL, and size limit
  const [cache, setCache] = useState(() => {
    try {
      const saved = localStorage.getItem('apiCache');
      if (!saved) return {};

      const parsed = JSON.parse(saved);
      if (parsed.version !== CACHE_VERSION) return {};

      // Clean expired entries
      const now = Date.now();
      const cleaned = Object.entries(parsed.data).reduce((acc, [key, value]) => {
        if (now - value.timestamp < CACHE_MAX_AGE) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return cleaned;
    } catch (error) {
      console.error('Cache load error:', error);
      return {};
    }
  });

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist search history
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(-10)));
  }, [searchHistory]);

  // Persist cache with cleanup
  useEffect(() => {
    try {
      // Limit cache size
      const entries = Object.entries(cache);
      if (entries.length > CACHE_MAX_ITEMS) {
        const sorted = entries.sort(([, a], [, b]) => b.timestamp - a.timestamp);
        const newCache = sorted.slice(0, CACHE_MAX_ITEMS).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        setCache(newCache);
      }

      localStorage.setItem('apiCache', JSON.stringify({
        version: CACHE_VERSION,
        data: cache
      }));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, [cache]);

  const updateCache = (key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  };

  const getCachedData = (key) => {
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_MAX_AGE) {
      // Clean up expired entry
      setCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      return null;
    }
    return entry.data;
  };

  const addToSearchHistory = (country) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== country);
      return [...filtered, country].slice(-10);
    });
  };

  const clearCache = () => {
    setCache({});
    localStorage.removeItem('apiCache');
  };

  const value = {
    darkMode,
    setDarkMode,
    cache: {
      get: getCachedData,
      set: updateCache,
      clear: clearCache
    },
    searchHistory,
    addToSearchHistory
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}