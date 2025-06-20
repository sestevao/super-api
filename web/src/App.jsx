import React, { useEffect, useState } from 'react';
import SuperInfoCard from './SuperInfoCard';

function App() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/super-info?country=france')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 p-6 flex items-center justify-center">
      {loading ? (
        <p className="text-gray-700 text-xl">Loading...</p>
      ) : (
        <SuperInfoCard data={info} />
      )}
    </div>
  );
}

export default App;
