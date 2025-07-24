import React, { useState, useCallback, useRef, Suspense } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useApp } from './AppContext';
import SkeletonCard from './SkeletonCard';

// Lazy load SuperInfoCard for better initial load performance
const SuperInfoCard = React.lazy(() => import('./SuperInfoCard'));

function App() {
  const {
    darkMode,
    setDarkMode,
    cache,
    searchHistory,
    addToSearchHistory
  } = useApp();

  const [country, setCountry] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Memoized axios instance with default config
  const api = React.useMemo(() => axios.create({
    timeout: 10000,
    headers: { 'Cache-Control': 'no-cache' }
  }), []);

  const fetchData = useCallback(async (searchCountry) => {
    if (!searchCountry?.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Check cache first
      const cachedData = cache.get(searchCountry.toLowerCase());
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      const res = await api.get(`/api/super-info?country=${searchCountry}`);
      setData(res.data);
      cache.set(searchCountry.toLowerCase(), res.data);
      addToSearchHistory(searchCountry);
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `Country "${searchCountry}" not found. Please check the spelling and try again.`
        : err.response?.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : 'Network error or server issue. Please try again later.';

      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [api, cache, addToSearchHistory]);

  // Debounced search to prevent too many API calls
  const debouncedFetch = React.useMemo(
    () => debounce((value) => fetchData(value), 500),
    [fetchData]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchData(country);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCountry(value);
    setShowSuggestions(value.length > 0);
    if (value.length >= 3) {
      debouncedFetch(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCountry(suggestion);
    setShowSuggestions(false);
    fetchData(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Accessibility improvements
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div 
      className={`${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } min-h-screen flex flex-col items-center p-8 transition-colors duration-300`}
    >
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🌍 Super Info App</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="relative flex items-center px-2 py-1 rounded-full bg-gray-300 dark:bg-gray-700 transition duration-300 w-20 h-10 shadow-md"
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          <span
            className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              darkMode ? 'translate-x-10 bg-yellow-400' : ''
            }`}
          />
          <span
            className={`absolute text-xs font-semibold transition-opacity duration-300 ${
              darkMode ? 'opacity-0' : 'opacity-100 left-10 text-gray-700'
            }`}
          >
            🌙
          </span>
          <span
            className={`absolute text-xs font-semibold transition-opacity duration-300 ${
              darkMode ? 'opacity-100 right-10 text-yellow-500' : 'opacity-0'
            }`}
          >
            ☀️
          </span>
        </button>
      </div>

      <div className="w-full max-w-2xl mb-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                className={`w-full px-4 py-2 border rounded shadow focus:outline-none focus:ring ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-300'
                } transition-colors duration-300`}
                aria-label="Enter country name (Press '/' to focus)"
                type="text"
                value={country}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter country (e.g., Japan)"
                minLength={2}
                required
                autoComplete="off"
              />
              {showSuggestions && searchHistory.length > 0 && (
                <ul
                  className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                  role="listbox"
                >
                  {searchHistory.slice().reverse().map((item, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 cursor-pointer ${
                        darkMode
                          ? 'hover:bg-gray-700 focus:bg-gray-700'
                          : 'hover:bg-gray-100 focus:bg-gray-100'
                      }`}
                      onClick={() => handleSuggestionClick(item)}
                      role="option"
                      tabIndex={0}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Info'}
            </button>
          </div>
        </form>

        {error && (
          <div
            className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>

      <Suspense fallback={<SkeletonCard />}>
        {loading ? (
          <SkeletonCard />
        ) : (
          data && <SuperInfoCard data={data} />
        )}
      </Suspense>
    </div>
  );
}

export default App;