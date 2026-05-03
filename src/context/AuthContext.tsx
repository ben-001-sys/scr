/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearToken,
  getCurrentUser,
  getToken,
  login as loginRequest,
  register as registerRequest,
  saveToken,
} from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provides auth state (user + login/logout methods) to the whole app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Loads current user from /users/me when a token exists.
  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  // Handles login and stores the received JWT.
  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    saveToken(response.accessToken);
    setUser(response.user);
  }, []);

  // Handles register then stores JWT like login.
  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const response = await registerRequest(data);
      saveToken(response.accessToken);
      setUser(response.user);
    },
    [],
  );

  // Clears local auth session.
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    // Delay loading check by one tick to satisfy strict React hook lint rule.
    const timer = window.setTimeout(() => {
      refreshMe().finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshMe]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshMe }),
    [user, isLoading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for reading auth state from components.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
