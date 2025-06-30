import { AuthTokens } from '../types';
import { storageService } from './storage.service';
import { isPlatform } from '@ionic/react';
import { Browser } from '@capacitor/browser';

export class OAuthRedirectService {
  // Use iOS client for mobile, web client for browser
  private readonly CLIENT_ID = isPlatform('capacitor')
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS
    : import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // For iOS, use a web URL that will redirect to the app
  private readonly REDIRECT_URI = isPlatform('capacitor')
    ? 'http://localhost/oauth-redirect.html'
    : `${window.location.origin}/oauth-callback`;
    
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  async signIn(): Promise<void> {
    // Generate a random state for security
    const state = this.generateRandomString();
    await storageService.setItem('oauth_state', state);

    // Build the OAuth URL - use code flow for iOS
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: this.SCOPES,
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // For iOS, we need to use the Capacitor Browser API
    if (isPlatform('capacitor')) {
      // Open in the system browser which handles OAuth better
      await Browser.open({ url: authUrl });
      
      // Listen for the browser to be closed
      Browser.addListener('browserFinished', () => {
        console.log('Browser closed');
      });
    } else {
      // For web, redirect in the same window
      window.location.href = authUrl;
    }
  }

  async handleCallback(urlString: string): Promise<boolean> {
    try {
      // Parse the URL to get the authorization code
      const url = new URL(urlString);
      const params = new URLSearchParams(url.search);
      
      const code = params.get('code');
      const state = params.get('state');
      
      if (!code) {
        console.error('No authorization code in callback');
        return false;
      }

      // Verify state
      const savedState = await storageService.getItem('oauth_state');
      if (state !== savedState) {
        console.error('State mismatch in OAuth callback');
        return false;
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      if (!tokenResponse) {
        return false;
      }

      // Get user info
      const userInfo = await this.getUserInfo(tokenResponse.access_token);
      
      // Save tokens
      const tokens: AuthTokens = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || '',
        idToken: tokenResponse.id_token || '',
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
        scope: this.SCOPES.split(' ')
      };
      
      await storageService.saveAuthTokens(tokens);
      await storageService.removeItem('oauth_state');
      
      return true;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      return false;
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        code: code,
        client_id: this.CLIENT_ID,
        redirect_uri: this.REDIRECT_URI,
        grant_type: 'authorization_code'
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        console.error('Token exchange failed:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return null;
    }
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  }

  private generateRandomString(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async signOut(): Promise<void> {
    const tokens = await storageService.getAuthTokens();
    if (tokens?.accessToken) {
      // Revoke the token
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.accessToken}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error revoking token:', error);
      }
    }
    await storageService.clearAuthTokens();
  }

  async checkAuthStatus(): Promise<boolean> {
    const tokens = await storageService.getAuthTokens();
    return !!tokens && Date.now() < tokens.expiresAt;
  }
}

export const oauthRedirectService = new OAuthRedirectService();