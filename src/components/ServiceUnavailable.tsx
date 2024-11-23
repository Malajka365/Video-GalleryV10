import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ServiceUnavailable: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Service Temporarily Unavailable
        </h1>
        <p className="text-gray-600 mb-8">
          We're experiencing some technical difficulties with our service configuration. 
          Our team has been notified and is working to resolve this issue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ServiceUnavailable;