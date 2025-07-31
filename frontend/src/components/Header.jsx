import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className={`w-10 h-10 rounded-full ${getInitialColor()} relative flex items-center justify-center text-white font-bold text-lg`}>
          <span className="absolute inset-0 flex items-center justify-center">{getUserInitial()}</span>
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><button>Profile</button></li>
            <li><button>Settings</button></li>
            <li><button onClick={logout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;