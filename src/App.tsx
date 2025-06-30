import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonContent,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, mail, settings } from 'ionicons/icons';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import { storageService } from './services/storage.service';
import { oauthRedirectService } from './services/oauth-redirect.service';
import { App as CapacitorApp } from '@capacitor/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* Dark mode always on */
import '@ionic/react/css/palettes/dark.always.css';

/* Theme variables */
import './theme/variables.css';
import './theme/ios-design-system.css';

setupIonicReact({
  mode: 'ios'
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
    setupDeepLinkListener();
  }, []);

  const setupDeepLinkListener = () => {
    CapacitorApp.addListener('appUrlOpen', async (data) => {
      console.log('App opened with URL:', data.url);
      
      // Check if this is an OAuth callback
      if (data.url.includes('oauth')) {
        const success = await oauthRedirectService.handleCallback(data.url);
        if (success) {
          // Reload to show authenticated state
          window.location.reload();
        }
      }
    });
  };

  const checkAuth = async () => {
    const tokens = await storageService.getAuthTokens();
    setIsAuthenticated(!!tokens);
  };

  if (isAuthenticated === null) {
    return (
      <IonApp>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>Loading...</div>
        </IonContent>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/">
            <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
