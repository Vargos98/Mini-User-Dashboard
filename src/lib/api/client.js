const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class NetworkError extends Error {
  constructor() {
    super('The API is waking up. Retry in a few seconds.');
    this.name = 'NetworkError';
    this.status = 0;
  }
}

export const apiRequest = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new NetworkError();
  }

  const body = await parseBody(response);
  if (!response.ok) {
    const message = body?.error?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
};

export const toQuery = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return;
    search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
};
