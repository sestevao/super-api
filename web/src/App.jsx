import React, { useState } from 'react';
import axios from 'axios';
import SuperInfoCard from './SuperInfoCard';

function App() {
  const [country, setCountry] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchData = async () => {
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
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-6 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Toggle Dark Mode
      </button>

      <h1 className="text-3xl font-bold mb-6">🌍 Super Info App</h1>
      <div className="flex space-x-4 mb-6">
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
          // className="px-4 py-2 border rounded shadow focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          Get Info
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && <p>Loading...</p>}

      {data && <SuperInfoCard data={data} />}
    </div>
  );
}

export default App;
