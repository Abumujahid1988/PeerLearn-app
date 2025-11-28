import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="text-6xl text-red-500 mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
            🔒
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          You don't have the required permissions to access this page. This feature is only available for instructors and administrators.
        </p>

        {/* Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-8 text-sm text-gray-700">
          <p className="font-semibold mb-2">Need help?</p>
          <ul className="text-left space-y-1 text-gray-600">
            <li>• If you're an instructor, contact your administrator to upgrade your account.</li>
            <li>• If you believe this is an error, please reach out to support.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/courses"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            View Courses
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-8">
          Questions? <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
