import React from 'react';

const SuperInfoCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden p-6 space-y-6">
      {/* Country Info */}
      <div className="flex items-center space-x-4">
        <img src={data.flag} alt={data.country} className="w-20 h-14 object-cover rounded-lg border" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{data.country}</h2>
          <p className="text-gray-600">Capital: {data.capital}</p>
          <p className="text-gray-600">Population: {data.population.toLocaleString()}</p>
        </div>
      </div>

      {/* Weather */}
      <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg text-blue-800">Current Weather</h3>
        <p className="text-gray-700">Temperature: {data.weather.temperature}°C</p>
        <p className="text-gray-700">Wind Speed: {data.weather.windspeed} km/h</p>
      </div>

      {/* Fun Fact */}
      <div className="bg-yellow-50 p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg text-yellow-800">Fun Fact</h3>
        <p className="text-gray-700 italic">"{data.funFact}"</p>
      </div>

      {/* Word of the Day */}
      <div className="bg-purple-50 p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg text-purple-800">Word of the Day: <span className="font-bold">{data.wordOfTheDay.word}</span></h3>
        <p className="text-gray-700">Meaning: {data.wordOfTheDay.meaning}</p>
        <p className="text-gray-500 italic">Example: "{data.wordOfTheDay.example}"</p>
      </div>

      {/* Currency Conversion */}
      <div className="bg-green-50 p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg text-green-800">Currency Conversion</h3>
        <p className="text-gray-700">1 USD = {data.currencyConversion.rate} {data.currencyConversion.to}</p>
      </div>

      {/* Random Image */}
      <div>
        <img src={data.randomImage} alt="Random" className="w-full rounded-xl object-cover" />
      </div>
    </div>
  );
};

export default SuperInfoCard;
