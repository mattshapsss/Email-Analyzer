import { Preferences } from '@capacitor/preferences';
import { AuthTokens, Email, AnalysisResult, UserPreferences, CachedData } from '../types';

export class StorageService {
  private readonly AUTH_KEY = 'gmail_auth_tokens';
  private readonly USER_PREFS_KEY = 'user_preferences';
  private readonly EMAIL_CACHE_KEY = 'email_cache';
  private readonly ANALYSIS_CACHE_KEY = 'analysis_cache';
  private readonly WATCH_EXPIRATION_KEY = 'gmail_watch_expiration';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async saveAuthTokens(tokens: AuthTokens): Promise<void> {
    await Preferences.set({
      key: this.AUTH_KEY,
      value: JSON.stringify(tokens)
    });
  }

  async getAuthTokens(): Promise<AuthTokens | null> {
    const { value } = await Preferences.get({ key: this.AUTH_KEY });
    return value ? JSON.parse(value) : null;
  }

  async clearAuthTokens(): Promise<void> {
    await Preferences.remove({ key: this.AUTH_KEY });
  }

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async saveUserPreferences(prefs: UserPreferences): Promise<void> {
    await Preferences.set({
      key: this.USER_PREFS_KEY,
      value: JSON.stringify(prefs)
    });
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    const { value } = await Preferences.get({ key: this.USER_PREFS_KEY });
    return value ? JSON.parse(value) : this.getDefaultPreferences();
  }

  async cacheEmails(emails: Email[]): Promise<void> {
    const cachedData: CachedData<Email[]> = {
      data: emails,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    
    await Preferences.set({
      key: this.EMAIL_CACHE_KEY,
      value: JSON.stringify(cachedData)
    });
  }

  async getCachedEmails(): Promise<Email[] | null> {
    const { value } = await Preferences.get({ key: this.EMAIL_CACHE_KEY });
    if (!value) return null;

    const cached: CachedData<Email[]> = JSON.parse(value);
    
    if (Date.now() > cached.expiresAt) {
      await Preferences.remove({ key: this.EMAIL_CACHE_KEY });
      return null;
    }

    return cached.data.map(email => ({
      ...email,
      date: new Date(email.date)
    }));
  }

  async cacheAnalysisResults(results: AnalysisResult[]): Promise<void> {
    const cachedData: CachedData<AnalysisResult[]> = {
      data: results,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    
    await Preferences.set({
      key: this.ANALYSIS_CACHE_KEY,
      value: JSON.stringify(cachedData)
    });
  }

  async getCachedAnalysisResults(): Promise<AnalysisResult[] | null> {
    const { value } = await Preferences.get({ key: this.ANALYSIS_CACHE_KEY });
    if (!value) return null;

    const cached: CachedData<AnalysisResult[]> = JSON.parse(value);
    
    if (Date.now() > cached.expiresAt) {
      await Preferences.remove({ key: this.ANALYSIS_CACHE_KEY });
      return null;
    }

    return cached.data.map(result => ({
      ...result,
      analyzedAt: new Date(result.analyzedAt),
      deadline: result.deadline ? new Date(result.deadline) : undefined
    }));
  }

  async clearCache(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: this.EMAIL_CACHE_KEY }),
      Preferences.remove({ key: this.ANALYSIS_CACHE_KEY })
    ]);
  }

  async clearAllData(): Promise<void> {
    await Preferences.clear();
  }

  async saveWatchExpiration(expiration: number): Promise<void> {
    await Preferences.set({
      key: this.WATCH_EXPIRATION_KEY,
      value: expiration.toString()
    });
  }

  async getWatchExpiration(): Promise<number | null> {
    const { value } = await Preferences.get({ key: this.WATCH_EXPIRATION_KEY });
    return value ? parseInt(value) : null;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      notificationsEnabled: true,
      notificationTime: '09:00',
      highPriorityOnly: false,
      categories: [],
      analysisFrequency: 'hourly' as any,
      theme: 'system'
    };
  }
}

export const storageService = new StorageService();