const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://fitlog-z57z.onrender.com';

// Helper method to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper method to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Provide user-friendly error messages for common authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid credentials');
    } else if (response.status === 400) {
      throw new Error(errorData.message || 'Invalid request');
    } else if (response.status === 404) {
      throw new Error('Resource not found');
    } else if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
  }
  return response.json();
};

// Auth endpoints
export const login = async (email, password) => {
  const response = await fetch(`${BASE_API_URL}/api/auth/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(response);
};

export const register = async (firstName, lastName, email, password) => {
  const response = await fetch(`${BASE_API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email, password })
  });
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetch(`${BASE_API_URL}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// User endpoints
export const getUserProfile = async () => {
  const response = await fetch(`${BASE_API_URL}/api/user/profile`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateUserProfile = async (userData) => {
  const response = await fetch(`${BASE_API_URL}/api/user/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

export const getUserAccount = async () => {
  const response = await fetch(`${BASE_API_URL}/api/user/account`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const deleteUserAccount = async () => {
  const response = await fetch(`${BASE_API_URL}/api/user/account`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Workout endpoints
export const getWorkouts = async (from, to) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from.toISOString().split('T')[0]);
  if (to) params.append('to', to.toISOString().split('T')[0]);
  
  const response = await fetch(`${BASE_API_URL}/api/workout?${params}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getWorkoutById = async (id) => {
  const response = await fetch(`${BASE_API_URL}/api/workout/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const createWorkout = async (workoutData) => {
  const response = await fetch(`${BASE_API_URL}/api/workout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(workoutData)
  });
  return handleResponse(response);
};

export const updateWorkout = async (id, workoutData) => {
  const response = await fetch(`${BASE_API_URL}/api/workout/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(workoutData)
  });
  return handleResponse(response);
};

export const deleteWorkout = async (id) => {
  const response = await fetch(`${BASE_API_URL}/api/workout/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Calendar endpoints
export const getWorkoutCalendar = async (monthString) => {
  const response = await fetch(`${BASE_API_URL}/api/workout/calendar?month=${monthString}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// AI/Gemini endpoints
export const getWorkoutAnalysis = async (workoutId, goal) => {
  const response = await fetch(`${BASE_API_URL}/api/gemini/workout/${workoutId}?goal=${goal}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getPeriodAnalysis = async (goal) => {
  const response = await fetch(`${BASE_API_URL}/api/gemini/period?goal=${goal}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}; 
