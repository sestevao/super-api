import React, { useState } from 'react';
import axios from 'axios';
import SuperInfoCard from './SuperInfoCard';

function App() {
  const [country, setCountry] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchData = async (e) => {
    if (e) e.preventDefault();
    if (!country) return;
    setLoading(true);

    try {
      const res = await axios.get(`/api/super-info?country=${country}`);
      console.log(res);
      setData(res.data);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Country not found');
      } else {
        setError('Network error or server issue');
      }
    }
    setLoading(false);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen flex flex-col items-center p-8`}>
      <div className="w-full flex justify-end mb-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="relative flex items-center px-2 py-1 rounded-full bg-gray-300 dark:bg-gray-700 transition duration-300 w-20 h-10 shadow-md"
        >
          <span
            className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              darkMode ? 'translate-x-10 bg-yellow-400' : ''
            }`}
          ></span>
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
          <span className="sr-only">Toggle Dark Mode</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">🌍 Super Info App</h1>

      {/* Wrap input and button inside a form */}
      <form onSubmit={fetchData} className="flex space-x-4 mb-6">
        <input
          className={`px-4 py-2 border rounded shadow focus:outline-none focus:ring ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-300'
          }`}
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Enter country (e.g., Japan)"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          Get Info
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && <p>Loading...</p>}

      {data && <SuperInfoCard data={data} />}
    </div>
  );
}

export default App;
