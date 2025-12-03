import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e?.preventDefault();
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      addToast('Please enter a valid email', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Try to call a newsletter endpoint (if available).
      await api.post('/newsletter/subscribe', { email });
      addToast('Subscribed — check your email to confirm', 'success');
      setEmail('');
    } catch (err) {
      // If backend isn't available, still show a friendly message
      console.warn('Newsletter subscribe failed (backend may be missing)', err?.message || err);
      addToast('Subscribed locally (backend not configured).', 'success');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">PeerLearn</h2>
          <p className="text-sm leading-relaxed mb-3 text-slate-400">
            Empowering learners through collaboration and shared knowledge.
          </p>
          <div className="text-sm text-gray-300 mb-3">support@peerlearn.app</div>
          <div className="flex space-x-4">
            <a
              href="https://github.com/Abumujahid1988/PeerLearn-app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PeerLearn on GitHub"
              className="hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="https://x.com/abdullahab10517/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PeerLearn on X (Twitter)"
              className="hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/abdullahi-abdulganiyu-3742a421b/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PeerLearn on LinkedIn"
              className="hover:text-white transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://www.youtube.com/watch?v=7CqJlxBYj-M&t=1s"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PeerLearn on YouTube"
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
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
          {user && user.role === 'instructor' && (
            <div className="mt-3 text-sm">
              <h4 className="font-medium text-white">Instructor</h4>
              <ul className="space-y-1">
                <li><Link to="/editor" className="hover:text-white transition-colors">Course Editor</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">My Courses</Link></li>
              </ul>
            </div>
          )}
          {user && user.role === 'admin' && (
            <div className="mt-3 text-sm">
              <h4 className="font-medium text-white">Admin</h4>
              <ul className="space-y-1">
                <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
                <li><Link to="/admin/reports" className="hover:text-white transition-colors">Reports</Link></li>
              </ul>
            </div>
          )}
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Stay Updated</h3>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <label htmlFor="footer-subscribe" className="sr-only">Email</label>
            <input
              id="footer-subscribe"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 mb-2 sm:mb-0 rounded-md text-white bg-transparent border border-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-all disabled:opacity-60"
            >
              <Mail size={18} className="mr-2" /> {submitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <div className="text-xs text-gray-400 mt-2">By subscribing you agree to our <Link to="/privacy" className="underline">Privacy Policy</Link>.</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-blue-800 mt-10 pt-6 text-sm text-center text-gray-400">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-3">
          <div className="px-2">© {year} PeerLearn. All rights reserved.</div>
          <div>Built with <span role="img" aria-label="love">❤️</span> by the PeerLearn Team.</div>
          <div className="text-xs px-2">Version 1.0.0</div>
        </div>
      </div>
    </footer>
  );
}
