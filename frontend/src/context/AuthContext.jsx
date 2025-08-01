import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up token validation
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // Fetch current user information
      const userData = await getCurrentUser();
      setUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        token
      });
    } catch (error) {
      console.error('Token validation failed:', error);
      // If token is expired or invalid, logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      
      const { token: newToken, firstName, lastName } = response;
      setToken(newToken);
      setUser({ firstName, lastName, email });
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await apiRegister(firstName, lastName, email, password);
      
      const { token: newToken } = response;
      setToken(newToken);
      setUser({ firstName, lastName, email });
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Provide user-friendly registration error messages
      let userMessage = 'Registration failed. Please try again.';
      if (error.message.includes('email') || error.message.includes('Email')) {
        userMessage = 'An account with this email already exists.';
      } else if (error.message.includes('password') || error.message.includes('Password')) {
        userMessage = 'Password must be at least 6 characters long.';
      } else if (error.message.includes('Invalid request')) {
        userMessage = 'Please check your information and try again.';
      }
      
      return { 
        success: false, 
        error: userMessage
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 