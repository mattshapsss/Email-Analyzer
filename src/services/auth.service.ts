import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AuthTokens, User } from '../types';
import { storageService } from './storage.service';
import { isPlatform } from '@ionic/react';

export class AuthService {
  private readonly GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  async initialize(): Promise<void> {
    if (isPlatform('capacitor')) {
      // Initialize for native app
      GoogleAuth.initialize({
        clientId: this.GOOGLE_CLIENT_ID,
        scopes: this.SCOPES,
        grantOfflineAccess: true, // For refresh tokens
      });
    }
  }

  async signIn(): Promise<User> {
    try {
      let authResult;
      
      if (isPlatform('capacitor')) {
        // Native app flow
        authResult = await GoogleAuth.signIn();
      } else {
        // Web fallback for development
        authResult = await this.webSignIn();
      }

      const tokens: AuthTokens = {
        accessToken: authResult.authentication.accessToken,
        refreshToken: authResult.authentication.refreshToken || '',
        idToken: authResult.authentication.idToken,
        expiresAt: Date.now() + (3600 * 1000), // 1 hour
        scope: this.SCOPES
      };

      await storageService.saveAuthTokens(tokens);

      const user: User = {
        id: authResult.user.id,
        email: authResult.user.email,
        name: authResult.user.name || authResult.user.displayName || '',
        picture: authResult.user.picture || authResult.user.imageUrl,
        preferences: await this.getDefaultPreferences()
      };

      return user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  async signOut(): Promise<void> {
    try {
      if (isPlatform('capacitor')) {
        await GoogleAuth.signOut();
      }
      await storageService.clearAuthTokens();
      await storageService.clearCache();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async refreshTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await storageService.getAuthTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      if (isPlatform('capacitor')) {
        // Use GoogleAuth refresh
        await GoogleAuth.refresh();
        const newAuth = await GoogleAuth.signIn();
        
        const newTokens: AuthTokens = {
          ...tokens,
          accessToken: newAuth.authentication.accessToken,
          expiresAt: Date.now() + (3600 * 1000)
        };
        
        await storageService.saveAuthTokens(newTokens);
        return newTokens;
      } else {
        // Web fallback
        return await this.webRefreshToken(tokens.refreshToken);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    const tokens = await storageService.getAuthTokens();
    if (!tokens) return false;

    // Check if token is expired
    if (Date.now() >= tokens.expiresAt) {
      const refreshed = await this.refreshTokens();
      return !!refreshed;
    }

    return true;
  }

  private async webSignIn(): Promise<any> {
    // Web OAuth flow for development
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: this.GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin + '/auth/callback',
      response_type: 'code',
      scope: this.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    })}`;

    window.open(authUrl, '_blank');
    
    // In a real implementation, you'd handle the callback
    throw new Error('Web sign-in requires callback implementation');
  }

  private async webRefreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.GOOGLE_CLIENT_ID,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      idToken: data.id_token || '',
      expiresAt: Date.now() + (data.expires_in * 1000),
      scope: this.SCOPES
    };

    await storageService.saveAuthTokens(tokens);
    return tokens;
  }

  private async getDefaultPreferences(): Promise<any> {
    const stored = await storageService.getUserPreferences();
    return stored || {
      notificationsEnabled: true,
      notificationTime: '09:00',
      highPriorityOnly: false,
      categories: [],
      analysisFrequency: 'realtime',
      theme: 'system'
    };
  }
}

export const authService = new AuthService();