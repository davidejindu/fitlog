import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = ({ logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  // Get user's first name initial and generate a color
  const getUserInitial = () => {
    if (user && user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return 'U'; // Default to 'U' for User
  };

  const getInitialColor = () => {
    const colors = [
      'bg-primary',
      'bg-secondary', 
      'bg-accent',
      'bg-success',
      'bg-warning',
      'bg-error',
      'bg-info'
    ];
    const initial = getUserInitial();
    const colorIndex = initial.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="navbar bg-base-200">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><button onClick={() => navigate('/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>Dashboard</button></li>
            <li><button onClick={() => navigate('/analytics')} className={isActive('/analytics') ? 'active' : ''}>Analytics</button></li>
            <li><button onClick={() => navigate('/ai-insights')} className={isActive('/ai-insights') ? 'active' : ''}>AI Insights</button></li>
          </ul>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost text-xl">FitLog</button>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><button onClick={() => navigate('/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>Dashboard</button></li>
          <li><button onClick={() => navigate('/analytics')} className={isActive('/analytics') ? 'active' : ''}>Analytics</button></li>
          <li><button onClick={() => navigate('/ai-insights')} className={isActive('/ai-insights') ? 'active' : ''}>AI Insights</button></li>
        </ul>
      </div>
      <div className="navbar-end">
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle mr-2"
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className={`w-10 h-10 rounded-full ${getInitialColor()} relative flex items-center justify-center text-white font-bold text-lg`}>
          <span className="absolute inset-0 flex items-center justify-center">{getUserInitial()}</span>
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><button onClick={() => navigate('/profile')}>Profile</button></li>
            <li><button onClick={() => navigate('/settings')}>Settings</button></li>
            <li><button onClick={logout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;