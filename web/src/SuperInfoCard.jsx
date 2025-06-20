import React from 'react';

const SuperInfoCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8 space-y-8 transition-transform transform hover:scale-[1.01] duration-300">
      {/* Country Info */}
      <div className="flex items-center space-x-6 border-b pb-4">
        <img src={data?.flag} alt={data?.country} className="w-24 h-16 object-cover rounded-md border shadow-sm" />
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">{data?.country}</h2>
          <p className="text-gray-600">🌍 Capital: <span className="font-medium">{data?.capital}</span></p>
          <p className="text-gray-600">👥 Population: {data?.population.toLocaleString()}</p>
        </div>
      </div>

      {/* Weather */}
      <div className="bg-blue-100 p-5 rounded-xl shadow-md hover:shadow-lg transition">
        <h3 className="font-semibold text-xl text-blue-800 mb-2">🌤️ Current Weather</h3>
        <p className="text-gray-700">Temperature: {data?.weather.temperature}°C</p>
        <p className="text-gray-700">Wind Speed: {data?.weather.windspeed} km/h</p>
      </div>

      {/* Fun Fact */}
      <div className="bg-yellow-100 p-5 rounded-xl shadow-md hover:shadow-lg transition">
        <h3 className="font-semibold text-xl text-yellow-800 mb-2">🎲 Fun Fact</h3>
        <p className="text-gray-700 italic">"{data?.funFact}"</p>
      </div>

      {/* Word of the Day */}
      <div className="bg-purple-100 p-5 rounded-xl shadow-md hover:shadow-lg transition">
        <h3 className="font-semibold text-xl text-purple-800 mb-2">📚 Word of the Day: <span className="font-bold">{data?.wordOfTheDay.word}</span></h3>
        <p className="text-gray-700">Meaning: {data?.wordOfTheDay.meaning}</p>
        <p className="text-gray-500 italic">Example: "{data?.wordOfTheDay.example}"</p>
      </div>

      {/* Currency Conversion */}
      <div className="bg-green-100 p-5 rounded-xl shadow-md hover:shadow-lg transition">
        <h3 className="font-semibold text-xl text-green-800 mb-2">💱 Currency Conversion</h3>
        <p className="text-gray-700">1 USD = {data?.currencyConversion.rate} {data?.currencyConversion.to}</p>
      </div>

      {/* Random Image */}
      <div className="rounded-xl overflow-hidden">
        <img
          src={data?.randomImage}
          alt="Random"
          className="w-full h-64 object-cover rounded-xl transform hover:scale-105 transition duration-500"
        />
      </div>
    </div>
  );
};

export default SuperInfoCard;
