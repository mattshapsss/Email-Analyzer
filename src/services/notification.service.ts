import { PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { NotificationPayload, AnalysisResult, UrgencyLevel } from '../types';
import { storageService } from './storage.service';

export class NotificationService {
  private isInitialized = false;
  private pushToken: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      await PushNotifications.register();
      this.setupListeners();
      this.isInitialized = true;
    } else {
      console.warn('Push notification permission denied');
    }
  }

  private setupListeners(): void {
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success:', token.value);
      this.pushToken = token.value;
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', 
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: any) => {
        console.log('Push notification action performed:', notification);
        this.handleNotificationAction(notification);
      }
    );
  }

  async scheduleAnalysisNotification(results: AnalysisResult[]): Promise<void> {
    const preferences = await storageService.getUserPreferences();
    if (!preferences?.notificationsEnabled) return;

    const highPriorityResults = results.filter(
      result => result.urgencyLevel === UrgencyLevel.HIGH
    );

    const actionRequiredResults = preferences.highPriorityOnly
      ? highPriorityResults
      : results.filter(result => result.needsAction);

    if (actionRequiredResults.length === 0) return;

    const notification: NotificationPayload = {
      title: 'Email Analysis Complete',
      body: this.buildNotificationBody(actionRequiredResults),
      badge: actionRequiredResults.length,
      data: {
        type: 'analysis_complete',
        resultCount: actionRequiredResults.length,
        highPriorityCount: highPriorityResults.length
      }
    };

    await this.sendLocalNotification(notification);
  }

  private buildNotificationBody(results: AnalysisResult[]): string {
    const highPriorityCount = results.filter(
      r => r.urgencyLevel === UrgencyLevel.HIGH
    ).length;

    if (highPriorityCount > 0) {
      return `${highPriorityCount} high priority email${highPriorityCount > 1 ? 's' : ''} need${highPriorityCount > 1 ? '' : 's'} immediate attention`;
    }

    return `${results.length} email${results.length > 1 ? 's' : ''} require${results.length > 1 ? '' : 's'} action`;
  }

  private async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      // In a real implementation, this would use a local notification plugin
      // For now, we'll just log it
      console.log('Local notification:', payload);
      
      // TODO: Implement with @capacitor/local-notifications when available
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // Handle notification when app is in foreground
    console.log('Notification received in app:', notification);
  }

  private handleNotificationAction(action: any): void {
    // Handle notification tap
    if (action.notification?.data?.type === 'analysis_complete') {
      // Navigate to dashboard or specific email
      window.location.href = '/tabs/dashboard';
    }
  }

  async getToken(): Promise<string | null> {
    return this.pushToken;
  }

  async removeAllListeners(): Promise<void> {
    await PushNotifications.removeAllListeners();
  }
}

export const notificationService = new NotificationService();