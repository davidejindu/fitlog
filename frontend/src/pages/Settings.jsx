import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL || 'https://fitlog-z57z.onrender.com'}/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        logout();
        navigate('/login');
      } else {
        console.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="card bg-base-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Profile</h3>
                  <p className="text-sm text-gray-600">Edit your personal information</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="btn btn-sm btn-outline"
                >
                  Manage
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-gray-600">{isDark ? 'Dark' : 'Light'} theme</p>
                </div>
                <label className="swap swap-rotate">
                  <input 
                    type="checkbox" 
                    checked={isDark}
                    onChange={toggleTheme}
                    className="theme-controller"
                  />
                  <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
                  <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-600">Workout reminders (coming soon)</p>
                </div>
                <div className="badge badge-outline">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="card bg-base-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-gray-600">Download your workout data (coming soon)</p>
                </div>
                <div className="badge badge-outline">Coming Soon</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Privacy Policy</h3>
                  <p className="text-sm text-gray-600">Read our privacy policy</p>
                </div>
                <button className="btn btn-sm btn-outline">
                Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card bg-base-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="btn btn-sm btn-outline"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Sign Out'
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-error/10 rounded-lg border border-error/20">
                <div>
                  <h3 className="font-medium text-error">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="btn btn-sm btn-error"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="card bg-base-200 p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Version</h3>
                  <p className="text-sm text-gray-600">FitLog v1.0.0</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <h3 className="font-medium">Terms of Service</h3>
                  <p className="text-sm text-gray-600">Read our terms of service</p>
                </div>
                <button className="btn btn-sm btn-outline">
                Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 