import { AuthTokens, Email, ApiError } from '../types';
import { storageService } from './storage.service';

export class GmailWebService {
  private readonly BATCH_SIZE = 10;
  private readonly BASE_URL = 'https://gmail.googleapis.com/gmail/v1';

  async setTokens(tokens: AuthTokens): Promise<void> {
    await storageService.saveAuthTokens(tokens);
  }

  async fetchEmails(maxResults: number = 100): Promise<Email[]> {
    try {
      const tokens = await storageService.getAuthTokens();
      if (!tokens) {
        throw new Error('No authentication tokens found');
      }

      // Check if token needs refresh
      if (Date.now() >= tokens.expiresAt - 300000) { // 5 minutes before expiry
        throw new Error('Token expired, please refresh');
      }

      const response = await fetch(`${this.BASE_URL}/users/me/messages?maxResults=${maxResults}&q=is:unread OR is:starred`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.messages || data.messages.length === 0) {
        return [];
      }

      // Fetch details for each email
      const emails: Email[] = [];
      for (let i = 0; i < Math.min(data.messages.length, maxResults); i += this.BATCH_SIZE) {
        const batch = data.messages.slice(i, i + this.BATCH_SIZE);
        const batchEmails = await Promise.all(
          batch.map((msg: any) => this.fetchEmailDetails(msg.id, tokens.accessToken))
        );
        emails.push(...batchEmails.filter(Boolean) as Email[]);
      }

      return emails;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async fetchEmailDetails(messageId: string, accessToken: string): Promise<Email | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/me/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch email ${messageId}`);
        return null;
      }

      const message = await response.json();
      const headers = message.payload?.headers || [];
      
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const email: Email = {
        id: message.id,
        threadId: message.threadId,
        from: getHeader('from'),
        to: getHeader('to').split(',').map((e: string) => e.trim()),
        subject: getHeader('subject'),
        body: this.extractBody(message.payload),
        date: new Date(parseInt(message.internalDate)),
        labels: message.labelIds || [],
        attachments: this.extractAttachments(message.payload),
        isRead: !message.labelIds?.includes('UNREAD'),
        isStarred: message.labelIds?.includes('STARRED') || false
      };

      return email;
    } catch (error) {
      console.error(`Failed to fetch email ${messageId}:`, error);
      return null;
    }
  }

  private extractBody(payload: any): string {
    if (!payload) return '';

    // Try to get plain text first
    if (payload.body?.data) {
      return this.decodeBase64(payload.body.data);
    }

    if (payload.parts) {
      // Look for plain text part
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return this.decodeBase64(part.body.data);
        }
      }
      // Fallback to HTML if no plain text
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          // Simple HTML stripping
          const html = this.decodeBase64(part.body.data);
          return html.replace(/<[^>]*>?/gm, '');
        }
      }
    }

    return '';
  }

  private decodeBase64(data: string): string {
    // URL-safe base64 decode
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      console.error('Failed to decode base64:', e);
      return '';
    }
  }

  private extractAttachments(payload: any): any[] {
    const attachments: any[] = [];
    
    if (!payload?.parts) return attachments;

    const extractFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size || 0
          });
        }
        if (part.parts) {
          extractFromParts(part.parts);
        }
      }
    };

    extractFromParts(payload.parts);
    return attachments;
  }

  private handleError(error: any): ApiError {
    console.error('Gmail API Error:', error);
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error
    };
  }
}

export const gmailWebService = new GmailWebService();