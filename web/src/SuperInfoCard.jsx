import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('SuperInfoCard Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleRetry = () => {
    if (retryCount < 3) {
      setHasError(false);
      setRetryCount(prev => prev + 1);
    }
  };

  if (hasError) {
    return (
      <div className="max-w-4xl w-full bg-red-50 dark:bg-red-900 rounded-2xl shadow-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-300">Something went wrong</h2>
        {retryCount < 3 && (
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Retry
          </button>
        )}
        <p className="text-red-500 dark:text-red-400 mt-2">
          {retryCount >= 3 ? 'Please try refreshing the page' : 'Attempting to recover...'}
        </p>
      </div>
    );
  }

  return children;
};

const ProgressiveImage = memo(({ src, alt, className, onError }) => {
  const [imageSrc, setImageSrc] = useState('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = onError;
  }, [src, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      loading="lazy"
    />
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

const InfoSection = memo(({ title, children, className, icon, isVisible }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`${className} ${
        show ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      } transition-all duration-500 p-5 rounded-xl shadow-md hover:shadow-lg`}
      role="region"
      aria-label={title}
      tabIndex={0}
    >
      <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
});

InfoSection.displayName = 'InfoSection';

const SuperInfoCard = memo(({ data }) => {
  const [visibleSections, setVisibleSections] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const showNextSection = () => {
      setVisibleSections(prev => Math.min(prev + 1, 6));
    };

    const timer = setInterval(showNextSection, 200);
    return () => clearInterval(timer);
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  if (!data) return null;

  return (
    <ErrorBoundary>
      <div 
        className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-8 transition-transform transform hover:scale-[1.01] duration-300"
        role="article"
        aria-label={`Information about ${data.country}`}
      >
        {/* Country Info */}
        <div className="flex items-center space-x-6 border-b dark:border-gray-700 pb-4">
          <ProgressiveImage
            src={imageError ? 'https://via.placeholder.com/600x400?text=Flag+Not+Available' : data.flag}
            alt={`Flag of ${data.country}`}
            className="w-24 h-16 object-cover rounded-md border shadow-sm"
            onError={handleImageError}
          />
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">{data.country}</h2>
            <p className="text-gray-600 dark:text-gray-300">🌍 Capital: <span className="font-medium">{data.capital}</span></p>
            <p className="text-gray-600 dark:text-gray-300">👥 Population: {data.population.toLocaleString()}</p>
          </div>
        </div>

        {/* Weather */}
        <InfoSection
          title="Current Weather"
          icon="🌤️"
          className="bg-blue-100 dark:bg-blue-900"
          isVisible={visibleSections >= 2}
        >
          <p className="text-gray-700 dark:text-gray-300">Temperature: {data.weather.temperature}°C</p>
          <p className="text-gray-700 dark:text-gray-300">Wind Speed: {data.weather.windspeed} km/h</p>
        </InfoSection>

        {/* Fun Fact */}
        <InfoSection
          title="Fun Fact"
          icon="🎲"
          className="bg-yellow-100 dark:bg-yellow-900"
          isVisible={visibleSections >= 3}
        >
          <p className="text-gray-700 dark:text-gray-300 italic">"{data.funFact}"</p>
        </InfoSection>

        {/* Word of the Day */}
        <InfoSection
          title={`Word of the Day: ${data.wordOfTheDay.word}`}
          icon="📚"
          className="bg-purple-100 dark:bg-purple-900"
          isVisible={visibleSections >= 4}
        >
          <p className="text-gray-700 dark:text-gray-300">Meaning: {data.wordOfTheDay.meaning}</p>
          <p className="text-gray-500 dark:text-gray-400 italic">Example: "{data.wordOfTheDay.example}"</p>
        </InfoSection>

        {/* Currency Conversion */}
        <InfoSection
          title="Currency Conversion"
          icon="💱"
          className="bg-green-100 dark:bg-green-900"
          isVisible={visibleSections >= 5}
        >
          <p className="text-gray-700 dark:text-gray-300">
            1 USD = {data.currencyConversion.rate} {data.currencyConversion.to}
          </p>
        </InfoSection>

        {/* Random Image */}
        {visibleSections >= 6 && (
          <div className="rounded-xl overflow-hidden">
            <ProgressiveImage
              src={data.randomImage}
              alt={`Random image related to ${data.country}`}
              className="w-full h-64 object-cover rounded-xl transform hover:scale-105 transition duration-500"
              onError={handleImageError}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

SuperInfoCard.propTypes = {
  data: PropTypes.shape({
    country: PropTypes.string.isRequired,
    capital: PropTypes.string.isRequired,
    population: PropTypes.number.isRequired,
    flag: PropTypes.string.isRequired,
    weather: PropTypes.shape({
      temperature: PropTypes.number.isRequired,
      windspeed: PropTypes.number.isRequired
    }).isRequired,
    funFact: PropTypes.string.isRequired,
    randomImage: PropTypes.string.isRequired,
    wordOfTheDay: PropTypes.shape({
      word: PropTypes.string.isRequired,
      meaning: PropTypes.string.isRequired,
      example: PropTypes.string
    }).isRequired,
    currencyConversion: PropTypes.shape({
      rate: PropTypes.number.isRequired,
      to: PropTypes.string.isRequired
    }).isRequired
  })
};

SuperInfoCard.displayName = 'SuperInfoCard';

export default SuperInfoCard;