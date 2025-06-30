import { storageService } from './storage.service';

export interface DailyMetrics {
  emailsAnalyzedToday: number;
  urgentEmailsToday: number;
  lastResetDate: string;
}

export interface AnalyzedEmail {
  emailId: string;
  analyzedAt: number;
  wasUrgent: boolean;
  urgencyLevel?: string;
}

export class DailyMetricsService {
  private readonly METRICS_KEY = 'daily_email_metrics';
  private readonly ANALYZED_EMAILS_KEY = 'analyzed_emails_history';
  private readonly MAX_HISTORY_DAYS = 7;

  /**
   * Get the start of today in user's local timezone
   */
  private getStartOfToday(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  /**
   * Get the end of today in user's local timezone
   */
  private getEndOfToday(): Date {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now;
  }

  /**
   * Check if a timestamp is from today
   */
  private isToday(timestamp: number): boolean {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Get all analyzed emails from storage
   */
  private async getAnalyzedEmails(): Promise<AnalyzedEmail[]> {
    const data = await storageService.getItem(this.ANALYZED_EMAILS_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Save analyzed emails to storage
   */
  private async saveAnalyzedEmails(emails: AnalyzedEmail[]): Promise<void> {
    await storageService.setItem(this.ANALYZED_EMAILS_KEY, JSON.stringify(emails));
  }

  /**
   * Clean up old entries (older than MAX_HISTORY_DAYS)
   */
  private async cleanupOldEntries(): Promise<void> {
    const emails = await this.getAnalyzedEmails();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_HISTORY_DAYS);
    
    const filteredEmails = emails.filter(email => 
      email.analyzedAt > cutoffDate.getTime()
    );
    
    if (filteredEmails.length !== emails.length) {
      await this.saveAnalyzedEmails(filteredEmails);
    }
  }

  /**
   * Track that an email was analyzed
   */
  async trackEmailAnalyzed(emailId: string, wasUrgent: boolean, urgencyLevel?: string): Promise<void> {
    const emails = await this.getAnalyzedEmails();
    
    // Check if we've already analyzed this email today
    const existingIndex = emails.findIndex(e => 
      e.emailId === emailId && this.isToday(e.analyzedAt)
    );
    
    if (existingIndex === -1) {
      // New analysis for today
      emails.push({
        emailId,
        analyzedAt: Date.now(),
        wasUrgent,
        urgencyLevel
      });
      
      await this.saveAnalyzedEmails(emails);
      
      // Clean up old entries periodically
      if (Math.random() < 0.1) { // 10% chance to clean up
        await this.cleanupOldEntries();
      }
    }
  }

  /**
   * Get today's metrics
   */
  async getTodayMetrics(): Promise<DailyMetrics> {
    const emails = await this.getAnalyzedEmails();
    
    // Filter for today's emails
    const todayEmails = emails.filter(email => this.isToday(email.analyzedAt));
    
    // Count total and urgent
    const emailsAnalyzedToday = todayEmails.length;
    const urgentEmailsToday = todayEmails.filter(email => email.wasUrgent).length;
    
    return {
      emailsAnalyzedToday,
      urgentEmailsToday,
      lastResetDate: this.getStartOfToday().toISOString()
    };
  }

  /**
   * Get metrics for a specific date range
   */
  async getMetricsForDateRange(startDate: Date, endDate: Date): Promise<{
    totalAnalyzed: number;
    totalUrgent: number;
  }> {
    const emails = await this.getAnalyzedEmails();
    
    const filteredEmails = emails.filter(email => 
      email.analyzedAt >= startDate.getTime() && 
      email.analyzedAt <= endDate.getTime()
    );
    
    return {
      totalAnalyzed: filteredEmails.length,
      totalUrgent: filteredEmails.filter(email => email.wasUrgent).length
    };
  }

  /**
   * Reset all metrics (for testing or manual reset)
   */
  async resetMetrics(): Promise<void> {
    await storageService.removeItem(this.ANALYZED_EMAILS_KEY);
  }

  /**
   * Get a summary of recent activity
   */
  async getRecentActivity(): Promise<{
    today: DailyMetrics;
    yesterday: { emailsAnalyzed: number; urgentEmails: number };
    lastWeek: { emailsAnalyzed: number; urgentEmails: number };
  }> {
    // Today
    const today = await this.getTodayMetrics();
    
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    const yesterdayMetrics = await this.getMetricsForDateRange(yesterday, yesterdayEnd);
    
    // Last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const now = new Date();
    
    const weekMetrics = await this.getMetricsForDateRange(weekAgo, now);
    
    return {
      today,
      yesterday: {
        emailsAnalyzed: yesterdayMetrics.totalAnalyzed,
        urgentEmails: yesterdayMetrics.totalUrgent
      },
      lastWeek: {
        emailsAnalyzed: weekMetrics.totalAnalyzed,
        urgentEmails: weekMetrics.totalUrgent
      }
    };
  }
}

export const dailyMetricsService = new DailyMetricsService();