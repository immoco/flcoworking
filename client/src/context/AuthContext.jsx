import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('fl_auth');
    return stored ? JSON.parse(stored) : { user: null, accessToken: null };
  });

  useEffect(() => {
    if (authState.user && authState.accessToken) {
      localStorage.setItem('fl_auth', JSON.stringify(authState));
      axios.defaults.headers.common.Authorization = `Bearer ${authState.accessToken}`;
    } else {
      localStorage.removeItem('fl_auth');
      delete axios.defaults.headers.common.Authorization;
    }
  }, [authState]);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    setAuthState({ user: response.data.user, accessToken: response.data.accessToken });
    return response.data;
  };

  const logout = () => {
    setAuthState({ user: null, accessToken: null });
    axios.post('/api/auth/logout').catch(() => {});
  };

  const value = useMemo(
    () => ({ user: authState.user, login, logout, setAuthState }),
    [authState.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
