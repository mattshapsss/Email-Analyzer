import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonText,
  IonIcon,
  IonBadge
} from '@ionic/react';
import { checkmarkCircle, alertCircle, time } from 'ionicons/icons';
import { gmailWebService } from '../services/gmail-web.service';
import { geminiService } from '../services/gemini.service';
import { gmailPushService } from '../services/gmail-push.service';
import { storageService } from '../services/storage.service';
import { dailyMetricsService } from '../services/daily-metrics.service';
import { Email, AnalysisResult, UrgencyLevel } from '../types';
import '../theme/ios-design-system.css';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [emailsAnalyzedToday, setEmailsAnalyzedToday] = useState(0);
  const [urgentEmailsToday, setUrgentEmailsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializeDashboard();
    setupEventListeners();
    setupMidnightReset();
    
    return () => {
      window.removeEventListener('new-emails-available', handleNewEmails);
    };
  }, []);

  // Set up a timer to reset metrics at midnight
  const setupMidnightReset = () => {
    const checkMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Calculate milliseconds until midnight
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      // Set a timeout to reset at midnight
      setTimeout(async () => {
        console.log('🕛 Midnight! Resetting daily metrics...');
        await loadTodayMetrics();
        
        // Set up the next midnight check
        setupMidnightReset();
      }, msUntilMidnight);
    };
    
    checkMidnight();
  };

  const initializeDashboard = async () => {
    try {
      const tokens = await storageService.getAuthTokens();
      if (tokens) {
        setIsActive(true);
        
        // Set up Gmail watch for push notifications
        console.log('Setting up Gmail push notifications...');
        await setupGmailWatch();
        
        // Fetch user info
        await fetchUserInfo(tokens.accessToken);
        
        // Load today's metrics
        await loadTodayMetrics();
        
        // Check initial emails
        await checkEmails();
        
        console.log('✅ Email Analyzer fully activated!');
        console.log('📱 You will now receive instant notifications for all emails');
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayMetrics = async () => {
    try {
      const metrics = await dailyMetricsService.getTodayMetrics();
      setEmailsAnalyzedToday(metrics.emailsAnalyzedToday);
      setUrgentEmailsToday(metrics.urgentEmailsToday);
    } catch (error) {
      console.error('Failed to load today metrics:', error);
    }
  };

  const setupGmailWatch = async () => {
    try {
      await gmailPushService.setupWatch();
      console.log('Gmail watch activated');
    } catch (error) {
      console.error('Failed to setup Gmail watch:', error);
    }
  };

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const setupEventListeners = () => {
    window.addEventListener('new-emails-available', handleNewEmails);
  };

  const handleNewEmails = async (event: any) => {
    console.log('New emails detected:', event.detail);
    await checkEmails();
  };

  const checkEmails = async () => {
    try {
      const emails = await gmailWebService.fetchEmails(20);
      
      // Analyze emails and track metrics
      await analyzeEmailsWithTracking(emails);
      
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to check emails:', error);
    }
  };

  const analyzeEmailsWithTracking = async (emails: Email[]) => {
    // Analyze each email with AI and track metrics
    for (const email of emails) {
      try {
        const analysis = await geminiService.analyzeEmail(email);
        
        // Determine if urgent (needs action and has urgency)
        const isUrgent = analysis.needsAction && analysis.urgencyLevel !== 'none';
        
        // Track this analysis
        await dailyMetricsService.trackEmailAnalyzed(
          email.id,
          isUrgent,
          analysis.urgencyLevel
        );
        
        // Update the UI with new metrics
        const updatedMetrics = await dailyMetricsService.getTodayMetrics();
        setEmailsAnalyzedToday(updatedMetrics.emailsAnalyzedToday);
        setUrgentEmailsToday(updatedMetrics.urgentEmailsToday);
        
      } catch (error) {
        console.error('Failed to analyze email:', error);
      }
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    // Reload today's metrics first
    await loadTodayMetrics();
    
    // Then check for new emails
    await checkEmails();
    
    event.detail.complete();
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <IonPage className="ios-page dark-theme">
      <IonContent fullscreen className="ios-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        
        <div className="dashboard-container">
          {/* Status Card */}
          <div className="ios-card status-card">
            <div className="status-icon-container">
              <IonIcon 
                icon={isActive ? checkmarkCircle : alertCircle} 
                className={`status-icon ${isActive ? 'active' : 'inactive'}`}
              />
            </div>
            
            <h1 className="ios-largeTitle status-title">
              {isActive ? 'Email Analyzer Active' : 'Not Connected'}
            </h1>
            
            {user && (
              <p className="ios-subheadline status-subtitle">
                {user.email}
              </p>
            )}
            
            <p className="ios-caption1 status-hint">
              {isActive ? 'Send yourself an email to test' : 'Sign in to activate'}
            </p>
          </div>

          {/* Stats */}
          {isActive && (
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-value">{emailsAnalyzedToday}</div>
                <div className="stat-label">Emails Analyzed Today</div>
              </div>
              
              <div className="stat-divider" />
              
              <div className="stat-item">
                <div className="stat-value urgent">{urgentEmailsToday}</div>
                <div className="stat-label">Urgent Emails Today</div>
              </div>
            </div>
          )}

          {/* Last Sync */}
          {isActive && lastSync && (
            <div className="sync-info">
              <IonIcon icon={time} className="sync-icon" />
              <span className="ios-footnote">
                Last checked {formatLastSync(lastSync)}
              </span>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          <div className="debug-info">
            <p className="ios-caption2">
              Push notifications will appear when new emails arrive
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;