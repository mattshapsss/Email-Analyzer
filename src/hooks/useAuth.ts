import { useState, useEffect, useCallback } from 'react';
import { AuthTokens, User } from '../types';
import { storageService } from '../services/storage.service';

interface UseAuthReturn {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedTokens = await storageService.getAuthTokens();
      if (storedTokens) {
        setTokens(storedTokens);
        // TODO: Validate tokens and load user data
      }
    } catch (err) {
      setError('Failed to load authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement Google OAuth login
      // This will be implemented when API keys are provided
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await storageService.clearAuthTokens();
      await storageService.clearCache();
      setUser(null);
      setTokens(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }
      // TODO: Implement token refresh
    } catch (err: any) {
      setError(err.message || 'Token refresh failed');
      await logout();
    }
  }, [tokens, logout]);

  return {
    user,
    tokens,
    isLoading,
    error,
    login,
    logout,
    refreshTokens
  };
};