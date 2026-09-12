import { apiRequest } from './client';

export const loginRequest = (email, password) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logoutRequest = () => apiRequest('/api/auth/logout', { method: 'POST' });

export const fetchSession = () => apiRequest('/api/auth/me');
