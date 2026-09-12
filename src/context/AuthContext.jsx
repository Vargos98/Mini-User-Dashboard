import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSession, loginRequest, logoutRequest } from '../lib/api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchSession()
      .then((payload) => setUser(payload.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      checking,
      login: async (email, password) => {
        const payload = await loginRequest(email, password);
        setUser(payload.user);
        return payload.user;
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
      },
    }),
    [user, checking]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
