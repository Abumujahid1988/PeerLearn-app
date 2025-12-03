import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-slate-900 text-slate-100 sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">PL</div>
            <div className="hidden sm:block">
              <div className="text-lg font-semibold text-white leading-tight">PeerLearn</div>
            </div>
          </Link>
        </div>

        {/* Desktop Links - Centered nav, auth at right */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-6">
          {user ? (
            <>
              <Link to="/courses" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/courses' ? 'text-white' : 'text-slate-300'}`}>Courses</Link>
              <Link to="/editor" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/editor' ? 'text-white' : 'text-slate-300'}`}>Course Editor</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/admin' ? 'text-white' : 'text-slate-300'}`}>Admin</Link>
              )}
              <Link to="/dashboard" className={`text-sm font-medium hover:text-white transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-slate-300'}`}>Dashboard</Link>
            </>
          ) : null}
        </div>

        {/* Auth links always at right */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {user && <div className="text-slate-300"><User size={18} /></div>}
          <button className="text-slate-300 hover:text-white focus:outline-none" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown - user-specific links only after login */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 shadow-sm">
          <div className="flex flex-col px-4 py-4 space-y-3 text-slate-100">
            {user ? (
              <>
                <Link to="/courses" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Courses</Link>
                <Link to="/editor" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Course Editor</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Admin</Link>
                )}
                <Link to="/dashboard" onClick={closeMenu} className="text-sm font-medium hover:text-white transition-colors">Dashboard</Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                    navigate('/');
                  }}
                  className="text-sm font-medium text-red-300 hover:text-red-200 text-left"
                >Logout</button>
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
