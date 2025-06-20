const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Retrying ${url} (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

app.get('/api/super-info', async (req, res) => {
  const country = req.query.country;
  if (!country) {
    return res.status(400).json({ error: 'Country query parameter is required' });
  }

  try {
    const countryRes = await fetchWithRetry(`https://restcountries.com/v3.1/name/${country}`);
    const countryData = countryRes.data[0];

    const capital = countryData.capital?.[0] || 'N/A';
    const lat = countryData.capitalInfo?.latlng?.[0] || 0;
    const lon = countryData.capitalInfo?.latlng?.[1] || 0;
    const flag = countryData.flags?.png || '';
    const currencyCode = Object.keys(countryData.currencies || {})[0] || 'USD';

    const weatherRes = await fetchWithRetry(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const weather = weatherRes.data.current_weather;

    const numberFactRes = await fetchWithRetry('http://numbersapi.com/random/trivia');
    const funFact = numberFactRes.data;

    const randomImage = `https://picsum.photos/seed/${country}/600/400`;

    const wordList = ['serendipity', 'eloquent', 'ephemeral', 'luminous', 'zenith'];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const dictRes = await fetchWithRetry(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
    const wordData = dictRes.data[0];

    const currencyRes = await fetchWithRetry(`https://open.er-api.com/v6/latest/USD`);
    const rate = currencyRes.data.rates[currencyCode] || 1;

    res.json({
      country: countryData.name.common,
      capital: capital,
      population: countryData.population,
      flag: flag,
      weather: weather,
      funFact: funFact,
      randomImage: randomImage,
      wordOfTheDay: {
        word: wordData.word,
        meaning: wordData.meanings[0]?.definitions[0]?.definition,
        example: wordData.meanings[0]?.definitions[0]?.example || 'No example available'
      },
      currencyConversion: {
        from: 'USD',
        to: currencyCode,
        rate: rate
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running at http://localhost:${PORT}/api/super-info`);
});
