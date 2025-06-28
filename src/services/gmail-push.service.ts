import { AuthTokens } from '../types';
import { storageService } from './storage.service';

export class GmailPushService {
  private readonly BASE_URL = 'https://gmail.googleapis.com/gmail/v1';
  private readonly TOPIC_NAME = 'projects/basic-dispatch-464317-m6/topics/gmail-push-notifications';
  
  async setupWatch(): Promise<any> {
    try {
      const tokens = await storageService.getAuthTokens();
      if (!tokens) {
        throw new Error('No authentication tokens found');
      }

      const watchRequest = {
        topicName: this.TOPIC_NAME,
        labelIds: ['INBOX'],
        labelFilterBehavior: 'INCLUDE'
      };

      const response = await fetch(`${this.BASE_URL}/users/me/watch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(watchRequest)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Watch setup failed: ${error.error?.message || response.statusText}`);
      }

      const watchResponse = await response.json();
      console.log('Gmail watch activated:', watchResponse);
      
      // Watch expires in 7 days, store expiration
      await this.storeWatchExpiration(watchResponse.expiration);
      
      // Send access token to Vercel for webhook to use
      await this.updateWebhookToken(tokens.accessToken);
      
      return watchResponse;
    } catch (error) {
      console.error('Failed to setup Gmail watch:', error);
      throw error;
    }
  }

  private async updateWebhookToken(accessToken: string): Promise<void> {
    try {
      // In production, this would securely update the webhook's access token
      // For now, we'll store it for the webhook to use
      console.log('Access token ready for webhook');
      
      // You could call an endpoint to securely store this token
      // await fetch('https://your-app.vercel.app/api/update-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: accessToken })
      // });
    } catch (error) {
      console.error('Failed to update webhook token:', error);
    }
  }

  async renewWatch(): Promise<void> {
    // Gmail watch must be renewed every 7 days
    const expiration = await this.getWatchExpiration();
    const now = Date.now();
    const dayBeforeExpiry = expiration - (24 * 60 * 60 * 1000);
    
    if (now >= dayBeforeExpiry) {
      console.log('Renewing Gmail watch...');
      await this.setupWatch();
    }
  }

  async stopWatch(): Promise<void> {
    try {
      const tokens = await storageService.getAuthTokens();
      if (!tokens) return;

      await fetch(`${this.BASE_URL}/users/me/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Gmail watch stopped');
    } catch (error) {
      console.error('Failed to stop Gmail watch:', error);
    }
  }

  private async storeWatchExpiration(expiration: string): Promise<void> {
    await storageService.saveWatchExpiration(parseInt(expiration));
  }

  private async getWatchExpiration(): Promise<number> {
    return await storageService.getWatchExpiration() || 0;
  }

  // Process incoming Pub/Sub notification
  async processNotification(message: any): Promise<void> {
    try {
      // Decode the Pub/Sub message
      const decodedData = atob(message.data);
      const notification = JSON.parse(decodedData);
      
      console.log('Gmail notification received:', notification);
      
      // Notification contains historyId
      // Use it to fetch only new messages since last sync
      if (notification.historyId) {
        await this.fetchNewMessages(notification.historyId);
      }
    } catch (error) {
      console.error('Failed to process notification:', error);
    }
  }

  private async fetchNewMessages(historyId: string): Promise<void> {
    // This would fetch only new messages using the history API
    // For now, we'll trigger a regular email fetch
    console.log('Fetching new messages since history:', historyId);
    
    // Emit event or call email fetch service
    window.dispatchEvent(new CustomEvent('new-emails-available', { 
      detail: { historyId } 
    }));
  }
}

export const gmailPushService = new GmailPushService();