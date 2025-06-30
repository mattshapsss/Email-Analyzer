import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonAlert
} from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { oauthRedirectService } from '../services/oauth-redirect.service';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await oauthRedirectService.signIn();
      
      // The OAuth redirect will handle the sign-in flow
      // For iOS, it will open in a new window
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '60px' }}>
            <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>
              Email Analyzer
            </h1>
            <IonText color="medium">
              <p style={{ fontSize: '1.2em' }}>
                AI-powered email insights at your fingertips
              </p>
            </IonText>
          </div>

          <div style={{ width: '100%', maxWidth: '300px' }}>
            <IonButton
              expand="block"
              size="large"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{ marginBottom: '20px' }}
            >
              {isLoading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon slot="start" icon={logoGoogle} />
                  Sign in with Google
                </>
              )}
            </IonButton>

            <IonText color="medium">
              <p style={{ fontSize: '0.9em', lineHeight: '1.5' }}>
                We'll need permission to read your emails to analyze them. 
                Your data stays private and secure.
              </p>
            </IonText>
          </div>
        </div>

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="Sign In Failed"
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;