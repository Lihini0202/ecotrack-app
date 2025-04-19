const API_BASE = 'http://localhost:5000';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const getUserProfile = async (token) => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { 'x-auth-token': token },
  });
  return handleResponse(response);
};

export const logActivity = async (token, activityData) => {
  const response = await fetch(`${API_BASE}/api/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(activityData),
  });
  return handleResponse(response);
};

export const getEcoNews = async () => {
  const response = await fetch(`${API_BASE}/api/news`);
  return handleResponse(response);
};