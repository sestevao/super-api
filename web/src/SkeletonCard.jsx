import React from 'react';

const SkeletonCard = () => {
  const pulseClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";
  
  return (
    <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-8">
      {/* Country Info Skeleton */}
      <div className="flex items-center space-x-6 border-b dark:border-gray-700 pb-4">
        <div className={`${pulseClass} w-24 h-16`} />
        <div className="flex-1">
          <div className={`${pulseClass} h-8 w-48 mb-2`} />
          <div className={`${pulseClass} h-4 w-36 mb-2`} />
          <div className={`${pulseClass} h-4 w-40`} />
        </div>
      </div>

      {/* Weather Skeleton */}
      <div className="bg-blue-100 dark:bg-blue-900 p-5 rounded-xl">
        <div className={`${pulseClass} h-6 w-40 mb-2`} />
        <div className={`${pulseClass} h-4 w-32 mb-2`} />
        <div className={`${pulseClass} h-4 w-36`} />
      </div>

      {/* Fun Fact Skeleton */}
      <div className="bg-yellow-100 dark:bg-yellow-900 p-5 rounded-xl">
        <div className={`${pulseClass} h-6 w-36 mb-2`} />
        <div className={`${pulseClass} h-4 w-full`} />
      </div>

      {/* Word of the Day Skeleton */}
      <div className="bg-purple-100 dark:bg-purple-900 p-5 rounded-xl">
        <div className={`${pulseClass} h-6 w-48 mb-2`} />
        <div className={`${pulseClass} h-4 w-full mb-2`} />
        <div className={`${pulseClass} h-4 w-3/4`} />
      </div>

      {/* Currency Conversion Skeleton */}
      <div className="bg-green-100 dark:bg-green-900 p-5 rounded-xl">
        <div className={`${pulseClass} h-6 w-44 mb-2`} />
        <div className={`${pulseClass} h-4 w-40`} />
      </div>

      {/* Image Skeleton */}
      <div className={`${pulseClass} w-full h-64 rounded-xl`} />
    </div>
  );
};

export default SkeletonCard;