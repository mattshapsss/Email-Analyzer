import { AuthTokens, User } from '../types';
import { storageService } from './storage.service';
import { isPlatform } from '@ionic/react';

export class SimpleAuthService {
  private readonly CLIENT_ID = isPlatform('capacitor') 
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS 
    : import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private tokenClient: any = null;
  private accessToken: string = '';

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        (window as any).google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: (response: any) => {
            this.handleAuthResponse(response);
          },
        });
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  async signIn(): Promise<void> {
    if (!this.tokenClient) {
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: (response: any) => {
          this.handleAuthResponse(response);
        },
      });
    }
    
    this.tokenClient.requestAccessToken();
  }

  private async handleAuthResponse(response: any) {
    if (response.access_token) {
      this.accessToken = response.access_token;
      
      // Get user info
      const userInfo = await this.getUserInfo(response.access_token);
      
      const tokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: '', // Not available with this flow
        idToken: '',
        expiresAt: Date.now() + (response.expires_in * 1000),
        scope: response.scope.split(' ')
      };
      
      await storageService.saveAuthTokens(tokens);
      
      // Reload the page to show signed-in state
      window.location.reload();
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

  async signOut(): Promise<void> {
    await storageService.clearAuthTokens();
    if ((window as any).google?.accounts?.oauth2) {
      (window as any).google.accounts.oauth2.revoke(this.accessToken);
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    const tokens = await storageService.getAuthTokens();
    return !!tokens && Date.now() < tokens.expiresAt;
  }
}

export const simpleAuthService = new SimpleAuthService();