import React, { useState } from 'react';
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
import { authService } from '../services/auth.service';
import { gmailWebService } from '../services/gmail-web.service';
import { geminiService } from '../services/gemini.service';
import { storageService } from '../services/storage.service';

const TestAuth: React.FC = () => {
  const [status, setStatus] = useState<string>('Not signed in');
  const [user, setUser] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus('Initializing...');

      await authService.initialize();
      setStatus('Signing in...');

      const signedInUser = await authService.signIn();
      setUser(signedInUser);
      setStatus(`Signed in as ${signedInUser.email}`);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      setStatus('Sign in failed');
    } finally {
      setLoading(false);
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
        const fetchedEmails = await gmailWebService.fetchEmails(5); // Fetch only 5 for testing
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
      await authService.signOut();
      setUser(null);
      setEmails([]);
      setAnalysis(null);
      setStatus('Signed out');
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Test Authentication</IonTitle>
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
                  disabled={loading}
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

export default TestAuth;