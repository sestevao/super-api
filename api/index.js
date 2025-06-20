const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/super-info', async (req, res) => {
    const country = req.query.country;
    if (!country) return res.status(400).json({ error: 'Country query parameter is required' });

    try {
        // 1. Country Info - REST Countries
        const countryRes = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
        const countryData = countryRes.data[0];
        const capital = countryData.capital[0];
        const lat = countryData.capitalInfo.latlng[0];
        const lon = countryData.capitalInfo.latlng[1];
        const flag = countryData.flags.png;
        const currencyCode = Object.keys(countryData.currencies)[0];

        // 2. Weather Info - Open-Meteo
		const https = require('https');
		const agent = new https.Agent({ keepAlive: true });

		// 2. Weather Info - Open-Meteo (Fixed)
		const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`, {
			httpsAgent: agent,
			headers: {
				'User-Agent': 'SuperAPI/1.0'
			}
		});
		const weather = weatherRes.data.current_weather;

        // 3. Fun Fact - Numbers API
        const numberFactRes = await axios.get('http://numbersapi.com/random/trivia');
        const funFact = numberFactRes.data;

        // 4. Random Image - Picsum
        const randomImage = `https://picsum.photos/seed/${country}/600/400`;

        // 5. Word of the Day - Free Dictionary
        const wordList = ['serendipity', 'eloquent', 'ephemeral', 'luminous', 'zenith'];
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        const dictRes = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
        const wordData = dictRes.data[0];

        // 6. Currency Conversion - ExchangeRate API (USD -> Country Currency)
        const currencyRes = await axios.get(`https://open.er-api.com/v6/latest/USD`);
        const rate = currencyRes.data.rates[currencyCode];

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
    console.log(`Super API running on http://localhost:${PORT}`);
});
