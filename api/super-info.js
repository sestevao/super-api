const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache with 5 minutes TTL and check period
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// Circuit breaker configuration
const circuitBreakers = new Map();
const BREAKER_THRESHOLD = 5; // failures before opening
const BREAKER_TIMEOUT = 30000; // 30 seconds timeout
const BREAKER_RESET = 60000; // 1 minute reset

// Rate limiting configuration
const requestCounts = new Map();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in milliseconds

// API endpoints configuration
const API_CONFIG = {
  countries: {
    url: 'https://restcountries.com/v3.1/name/',
    timeout: 5000,
    retries: 3
  },
  weather: {
    url: 'https://api.open-meteo.com/v1/forecast',
    timeout: 3000,
    retries: 2
  },
  numbers: {
    url: 'http://numbersapi.com/random/trivia',
    timeout: 3000,
    retries: 2
  },
  dictionary: {
    url: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    timeout: 3000,
    retries: 2
  },
  exchange: {
    url: 'https://open.er-api.com/v6/latest/USD',
    timeout: 3000,
    retries: 2
  }
};

// Circuit breaker implementation
class CircuitBreaker {
  constructor(name) {
    this.name = name;
    this.failures = 0;
    this.lastFailure = null;
    this.state = 'CLOSED';
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > BREAKER_RESET) {
        this.state = 'HALF-OPEN';
      } else {
        throw new Error(`Circuit breaker is open for ${this.name}`);
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF-OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.lastFailure = Date.now();
      this.failures++;

      if (this.failures >= BREAKER_THRESHOLD) {
        this.state = 'OPEN';
      }
      throw error;
    }
  }
}

// Enhanced fetch with retry and circuit breaker
async function fetchWithCircuitBreaker(name, url, options = {}) {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name));
  }
  const breaker = circuitBreakers.get(name);

  return breaker.call(async () => {
    const { retries = 3, delay = 1000, timeout = 5000 } = options;

    for (let i = 0; i < retries; i++) {
      try {
        return await axios.get(url, {
          timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Super-Info-App/1.0'
          }
        });
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
      }
    }
  });
}

// Rate limiting with cleanup
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }

  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

// Periodic cleanup of rate limiting data
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of requestCounts.entries()) {
    const recentRequests = times.filter(time => now - time < RATE_WINDOW);
    if (recentRequests.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, recentRequests);
    }
  }
}, RATE_WINDOW);

// Input validation
function validateCountry(country) {
  if (!country || typeof country !== 'string') {
    throw new Error('Invalid country parameter');
  }
  
  const sanitized = country.trim();
  if (sanitized.length < 2 || sanitized.length > 100) {
    throw new Error('Country name must be between 2 and 100 characters');
  }
  
  if (!/^[a-zA-Z\s-]+$/.test(sanitized)) {
    throw new Error('Country name contains invalid characters');
  }
  
  return sanitized;
}

// Health check endpoint
async function healthCheck() {
  const checks = await Promise.allSettled(
    Object.entries(API_CONFIG).map(async ([name, config]) => {
      try {
        await axios.get(config.url, { timeout: 2000 });
        return { name, status: 'up' };
      } catch (error) {
        return { name, status: 'down', error: error.message };
      }
    })
  );

  return checks.reduce((acc, check) => {
    acc[check.value.name] = check.value.status;
    return acc;
  }, {});
}

module.exports = async function handler(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Health check endpoint
    if (req.query.health === 'check') {
      const status = await healthCheck();
      res.json({ status: 'ok', services: status });
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Input validation
    let country;
    try {
      country = validateCountry(req.query.country);
    } catch (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    // Check cache
    const cacheKey = `country:${country.toLowerCase()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    // Fetch country data
    const countryRes = await fetchWithCircuitBreaker(
      'countries',
      `${API_CONFIG.countries.url}${encodeURIComponent(country)}`,
      API_CONFIG.countries
    );
    
    const countryData = countryRes.data[0];
    if (!countryData) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }

    const capital = countryData.capital?.[0] || 'N/A';
    const lat = countryData.capitalInfo?.latlng?.[0] || 0;
    const lon = countryData.capitalInfo?.latlng?.[1] || 0;
    const flag = countryData.flags?.png || '';
    const currencyCode = Object.keys(countryData.currencies || {})[0] || 'USD';

    // Parallel API requests with circuit breakers
    const [weatherRes, numberFactRes, dictRes, currencyRes] = await Promise.all([
      fetchWithCircuitBreaker(
        'weather',
        `${API_CONFIG.weather.url}?latitude=${lat}&longitude=${lon}&current_weather=true`,
        API_CONFIG.weather
      ),
      fetchWithCircuitBreaker(
        'numbers',
        API_CONFIG.numbers.url,
        API_CONFIG.numbers
      ),
      fetchWithCircuitBreaker(
        'dictionary',
        `${API_CONFIG.dictionary.url}${
          ['serendipity', 'eloquent', 'ephemeral', 'luminous', 'zenith'][
            Math.floor(Math.random() * 5)
          ]
        }`,
        API_CONFIG.dictionary
      ),
      fetchWithCircuitBreaker(
        'exchange',
        API_CONFIG.exchange.url,
        API_CONFIG.exchange
      )
    ]);

    const responseData = {
      country: countryData.name.common,
      capital: capital,
      population: countryData.population,
      flag: flag,
      weather: weatherRes.data.current_weather,
      funFact: numberFactRes.data,
      randomImage: `https://picsum.photos/seed/${encodeURIComponent(country)}/600/400`,
      wordOfTheDay: {
        word: dictRes.data[0].word,
        meaning: dictRes.data[0].meanings[0]?.definitions[0]?.definition,
        example: dictRes.data[0].meanings[0]?.definitions[0]?.example || 'No example available'
      },
      currencyConversion: {
        from: 'USD',
        to: currencyCode,
        rate: currencyRes.data.rates[currencyCode] || 1
      }
    };

    // Cache the response
    cache.set(cacheKey, responseData);
    res.json(responseData);

  } catch (error) {
    console.error('API Error:', error);

    // Enhanced error response
    const errorResponse = {
      error: 'An error occurred',
      message: error.response?.status === 404
        ? 'Country not found'
        : error.message === 'Circuit breaker is open'
          ? 'Service temporarily unavailable, please try again later'
          : 'Service temporarily unavailable',
      status: error.response?.status || 500,
      code: error.code,
      service: error.service
    };

    res.status(errorResponse.status).json(errorResponse);
  }
};