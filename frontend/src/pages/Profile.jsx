import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/apiService';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || ''
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.message.includes('401') || error.message.includes('JWT expired')) {
          logout();
          navigate('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [logout, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message.includes('401') || error.message.includes('JWT expired')) {
        logout();
        navigate('/login');
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Personal Information</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">First Name</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className="input input-bordered"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Last Name</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className="input input-bordered"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleSave}
                      className={`btn btn-primary ${saving ? 'loading' : ''}`}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-outline"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">First Name</span>
                      </label>
                      <p className="text-lg">{user?.firstName || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Last Name</span>
                      </label>
                      <p className="text-lg">{user?.lastName || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <p className="text-lg">{user?.email || 'Not set'}</p>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setEditing(true)}
                      className="btn btn-primary"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 