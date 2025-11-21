import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-blue-950 text-gray-100 sticky top-0 z-50 border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold">PL</div>
            <div className="hidden sm:block">
              <div className="text-lg font-semibold text-white leading-tight">PeerLearn</div>
            </div>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/courses" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname.startsWith('/courses') ? 'text-white' : 'text-blue-200'}`}>Courses</Link>
          <Link to="/about" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/about' ? 'text-white' : 'text-blue-200'}`}>About</Link>
          <Link to="/contact" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/contact' ? 'text-white' : 'text-blue-200'}`}>Contact</Link>

          {user ? (
            <>
              <Link to="/dashboard" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-blue-200'}`}>Dashboard</Link>
              {['instructor','admin'].includes(user.role) && <Link to="/editor" className="text-sm font-medium hover:text-white transition-colors text-blue-200">Course Editor</Link>}
              {user.role === 'admin' && <Link to="/admin" className="text-sm font-medium hover:text-white transition-colors text-blue-200">Admin</Link>}
              <button onClick={logout} className="ml-2 flex items-center gap-2 text-sm text-blue-200 hover:text-white">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {user && <div className="text-blue-200"><User size={18} /></div>}
          <button className="text-blue-200 hover:text-white focus:outline-none" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-blue-950 border-t border-blue-900 shadow-sm">
          <div className="flex flex-col px-4 py-4 space-y-3 text-blue-100">
            <Link to="/courses" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Courses</Link>
            <Link to="/about" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">About</Link>
            <Link to="/contact" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Contact</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Dashboard</Link>
                {['instructor','admin'].includes(user.role) && <Link to="/editor" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Course Editor</Link>}
                {user.role === 'admin' && <Link to="/admin" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Admin</Link>}
                <button onClick={() => { logout(); closeMenu(); }} className="text-sm font-medium text-red-300 hover:text-red-200 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Login</Link>
                <Link to="/register" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
