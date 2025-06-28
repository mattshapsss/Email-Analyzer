import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonText,
  IonItem,
  IonLabel
} from '@ionic/react';
import { gmailWebService } from '../services/gmail-web.service';
import { geminiService } from '../services/gemini.service';
import { storageService } from '../services/storage.service';
import { AuthTokens } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

const TestAuthSimple: React.FC = () => {
  const [status, setStatus] = useState<string>('Not signed in');
  const [user, setUser] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  useEffect(() => {
    // Load Google Identity Services library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleAuth = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: handleAuthResponse,
    });
    setTokenClient(client);
    setStatus('Google Auth initialized');
  };

  const handleAuthResponse = async (response: any) => {
    if (response.access_token) {
      try {
        setLoading(true);
        setError(null);
        
        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
          headers: {
            'Authorization': `Bearer ${response.access_token}`
          }
        });
        const userData = await userResponse.json();
        
        setUser(userData);
        
        // Save tokens
        const tokens: AuthTokens = {
          accessToken: response.access_token,
          refreshToken: '',
          idToken: '',
          expiresAt: Date.now() + (response.expires_in * 1000),
          scope: response.scope.split(' ')
        };
        
        await storageService.saveAuthTokens(tokens);
        setStatus(`Signed in as ${userData.email}`);
      } catch (err: any) {
        setError(err.message || 'Failed to get user info');
      } finally {
        setLoading(false);
      }
    } else if (response.error) {
      setError(`Auth error: ${response.error}`);
    }
  };

  const handleSignIn = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      setError('Google Auth not initialized');
    }
  };

  const handleFetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus('Fetching emails...');

      const tokens = await storageService.getAuthTokens();
      if (tokens) {
        await gmailWebService.setTokens(tokens);
        const fetchedEmails = await gmailWebService.fetchEmails(5);
        setEmails(fetchedEmails);
        setStatus(`Fetched ${fetchedEmails.length} emails`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch emails');
      setStatus('Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEmail = async () => {
    try {
      if (emails.length === 0) {
        setError('No emails to analyze');
        return;
      }

      setLoading(true);
      setError(null);
      setStatus('Analyzing email with Gemini...');

      const result = await geminiService.analyzeEmail(emails[0]);
      setAnalysis(result);
      setStatus('Analysis complete');
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      setStatus('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await storageService.clearAuthTokens();
      await storageService.clearCache();
      setUser(null);
      setEmails([]);
      setAnalysis(null);
      setStatus('Signed out');
      
      // Revoke token
      const tokens = await storageService.getAuthTokens();
      if (tokens?.accessToken && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(tokens.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Simple Auth Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Status: {status}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {error && (
              <IonText color="danger">
                <p>Error: {error}</p>
              </IonText>
            )}
            
            {user && (
              <IonItem>
                <IonLabel>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                </IonLabel>
              </IonItem>
            )}

            <div style={{ marginTop: '20px' }}>
              {!user ? (
                <IonButton
                  expand="block"
                  onClick={handleSignIn}
                  disabled={loading || !tokenClient}
                >
                  {loading ? <IonSpinner /> : 'Sign in with Google'}
                </IonButton>
              ) : (
                <>
                  <IonButton
                    expand="block"
                    onClick={handleFetchEmails}
                    disabled={loading}
                    style={{ marginBottom: '10px' }}
                  >
                    {loading ? <IonSpinner /> : `Fetch Emails (${emails.length} loaded)`}
                  </IonButton>
                  
                  {emails.length > 0 && (
                    <IonButton
                      expand="block"
                      onClick={handleAnalyzeEmail}
                      disabled={loading}
                      style={{ marginBottom: '10px' }}
                    >
                      {loading ? <IonSpinner /> : 'Analyze First Email'}
                    </IonButton>
                  )}
                  
                  <IonButton
                    expand="block"
                    color="medium"
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    Sign Out
                  </IonButton>
                </>
              )}
            </div>

            {emails.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3>First Email:</h3>
                <IonItem>
                  <IonLabel className="ion-text-wrap">
                    <h2>{emails[0].subject}</h2>
                    <p>From: {emails[0].from}</p>
                    <p>{emails[0].body.substring(0, 200)}...</p>
                  </IonLabel>
                </IonItem>
              </div>
            )}

            {analysis && (
              <div style={{ marginTop: '20px' }}>
                <h3>Analysis Result:</h3>
                <IonItem>
                  <IonLabel className="ion-text-wrap">
                    <p>Needs Action: {analysis.needsAction ? 'Yes' : 'No'}</p>
                    <p>Action Type: {analysis.actionType}</p>
                    <p>Urgency: {analysis.urgencyLevel}</p>
                    <p>Summary: {analysis.summary}</p>
                  </IonLabel>
                </IonItem>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default TestAuthSimple;