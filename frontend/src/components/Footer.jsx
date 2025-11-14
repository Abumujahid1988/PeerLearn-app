import React from 'react';
import { Mail, Github, Twitter, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">PeerLearn</h2>
          <p className="text-sm leading-relaxed mb-5 text-gray-400">
            Empowering learners through collaboration and shared knowledge.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/courses" className="hover:text-white transition-colors">Courses</a></li>
            <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="/faqs" className="hover:text-white transition-colors">FAQs</a></li>
            <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Stay Updated</h3>
          <form className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-3 py-2 mb-2 sm:mb-0 rounded-md text-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-all"
            >
              <Mail size={18} className="mr-2" /> Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-blue-800 mt-10 pt-6 text-sm text-center text-gray-400">
        <p>© {year} PeerLearn. All rights reserved.</p>
        <p className="mt-1">Built with ❤️ by the PeerLearn Team.</p>
      </div>
    </footer>
  );
}
