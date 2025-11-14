import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white py-28">
      <div className="max-w-5xl mx-auto text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Empower Your Learning Journey
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
          <span className="font-semibold text-white">PeerLearn</span> helps you
          master new skills through collaboration, micro-courses, and community-driven learning.
        </p>

        {/* Centered call-to-action buttons */}
        <div className="flex justify-center flex-wrap gap-4">
          <Link
            to="/courses"
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            Browse Courses
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Decorative background shape */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
    </section>
  );
}
