import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [country, setCountry] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!country) return;
    try {
      const res = await axios.get(`https://super-api-xhm7.vercel.app/api/super-info?country=${country}`);
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Error fetching data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">🌍 Super Info App</h1>
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Enter country (e.g., Japan)"
          className="px-4 py-2 border rounded shadow focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          Get Info
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {data && (
        <div className="bg-white rounded-lg shadow p-6 max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold">{data.country} ({data.capital})</h2>
          <img src={data.flag} alt="flag" className="w-32 mx-auto" />
          <p>Population: {data.population.toLocaleString()}</p>
          <div>
            <h3 className="font-medium">🌦️ Weather</h3>
            <p>{data.weather.temperature}°C | Wind: {data.weather.windspeed} km/h</p>
          </div>
          <div>
            <h3 className="font-medium">🎲 Fun Fact</h3>
            <p>{data.funFact}</p>
          </div>
          <div>
            <h3 className="font-medium">🖼️ Random Image</h3>
            <img src={data.randomImage} alt="random" className="rounded mx-auto" />
          </div>
          <div>
            <h3 className="font-medium">📚 Word of the Day</h3>
            <p><strong>{data.wordOfTheDay.word}</strong>: {data.wordOfTheDay.meaning}</p>
            <i>{data.wordOfTheDay.example}</i>
          </div>
          <div>
            <h3 className="font-medium">💱 Currency Conversion</h3>
            <p>1 USD = {data.currencyConversion.rate} {data.currencyConversion.to}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
