import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors"
        >
          PeerLearn
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/courses"
            className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
          >
            Courses
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                Dashboard
              </Link>
              {['instructor','admin'].includes(user.role) && (
                <Link
                  to="/editor"
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Course Editor
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700 hover:text-blue-700 focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
          <div className="flex flex-col px-6 py-4 space-y-3">
            <Link
              to="/courses"
              onClick={closeMenu}
              className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
            >
              Courses
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
