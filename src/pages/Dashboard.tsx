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
import { Email, AnalysisResult, UrgencyLevel } from '../types';
import '../theme/ios-design-system.css';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [emailCount, setEmailCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializeDashboard();
    setupEventListeners();
    
    return () => {
      window.removeEventListener('new-emails-available', handleNewEmails);
    };
  }, []);

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
      setEmailCount(emails.length);
      
      // Analyze emails for urgent items
      const urgent = await analyzeUrgentEmails(emails);
      setUrgentCount(urgent);
      
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to check emails:', error);
    }
  };

  const analyzeUrgentEmails = async (emails: Email[]): Promise<number> => {
    // In production, this would analyze all emails
    // For now, just count unread emails as potentially urgent
    return emails.filter(email => !email.isRead).length;
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
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
                <div className="stat-value">{emailCount}</div>
                <div className="stat-label">Recent Emails</div>
              </div>
              
              <div className="stat-divider" />
              
              <div className="stat-item">
                <div className="stat-value urgent">{urgentCount}</div>
                <div className="stat-label">Need Action</div>
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