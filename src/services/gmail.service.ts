import { google } from 'googleapis';
import { AuthTokens, Email, ApiError } from '../types';
import { StorageService } from './storage.service';

export class GmailService {
  private gmail = google.gmail('v1');
  private oauth2Client: any;
  private readonly BATCH_SIZE = 10;

  constructor(private storage: StorageService) {
    this.initializeOAuth();
  }

  private initializeOAuth() {
    this.oauth2Client = new google.auth.OAuth2(
      import.meta.env.VITE_GOOGLE_CLIENT_ID,
      '', // No client secret needed for iOS
      'com.emailanalyzer.app://oauth' // iOS redirect
    );
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiresAt
    });
    await this.storage.saveAuthTokens(tokens);
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      const tokens: AuthTokens = {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token!,
        idToken: credentials.id_token!,
        expiresAt: credentials.expiry_date!,
        scope: credentials.scope!.split(' ')
      };
      await this.storage.saveAuthTokens(tokens);
      return tokens;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async fetchEmails(maxResults: number = 100): Promise<Email[]> {
    try {
      const response = await this.gmail.users.messages.list({
        auth: this.oauth2Client,
        userId: 'me',
        maxResults,
        q: 'is:unread OR is:starred',
        includeSpamTrash: false
      });

      if (!response.data.messages) {
        return [];
      }

      const emails: Email[] = [];
      const messageIds = response.data.messages.slice(0, maxResults);

      for (let i = 0; i < messageIds.length; i += this.BATCH_SIZE) {
        const batch = messageIds.slice(i, i + this.BATCH_SIZE);
        const batchEmails = await Promise.all(
          batch.map((msg: any) => this.fetchEmailDetails(msg.id!))
        );
        emails.push(...batchEmails.filter(Boolean) as Email[]);
      }

      return emails;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async fetchEmailDetails(messageId: string): Promise<Email | null> {
    try {
      const response = await this.gmail.users.messages.get({
        auth: this.oauth2Client,
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload?.headers || [];
      
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const email: Email = {
        id: message.id!,
        threadId: message.threadId!,
        from: getHeader('from'),
        to: getHeader('to').split(',').map((e: string) => e.trim()),
        subject: getHeader('subject'),
        body: this.extractBody(message.payload),
        date: new Date(parseInt(message.internalDate!)),
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

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return '';
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
      details: error.response?.data || error
    };
  }
}

export const gmailService = new GmailService(new StorageService());