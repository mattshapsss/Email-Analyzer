export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  date: Date;
  labels: string[];
  attachments: Attachment[];
  isRead: boolean;
  isStarred: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface AnalysisResult {
  emailId: string;
  needsAction: boolean;
  actionType: ActionType;
  urgencyLevel: UrgencyLevel;
  deadline?: Date;
  category: EmailCategory;
  summary: string;
  confidence: number;
  analyzedAt: Date;
}

export enum ActionType {
  REPLY = 'reply',
  CALL = 'call',
  SCHEDULE = 'schedule',
  REVIEW = 'review',
  DELEGATE = 'delegate',
  NONE = 'none'
}

export enum UrgencyLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NONE = 'none'
}

export enum EmailCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  PROMOTIONAL = 'promotional',
  SOCIAL = 'social',
  UPDATES = 'updates',
  FORUMS = 'forums',
  SPAM = 'spam',
  OTHER = 'other'
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  notificationTime: string;
  highPriorityOnly: boolean;
  categories: EmailCategory[];
  analysisFrequency: AnalysisFrequency;
  theme: 'light' | 'dark' | 'system';
}

export enum AnalysisFrequency {
  REALTIME = 'realtime',
  HOURLY = 'hourly',
  TWICE_DAILY = 'twice_daily',
  DAILY = 'daily'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
  scope: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

export interface DashboardStats {
  totalEmails: number;
  unreadEmails: number;
  actionRequired: number;
  highPriority: number;
  todaysDeadlines: number;
  categoryCounts: Record<EmailCategory, number>;
}