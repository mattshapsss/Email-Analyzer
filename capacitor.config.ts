import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.emailanalyzer.app',
  appName: 'Email Analyzer',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    GoogleAuth: {
      scopes: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
      serverClientId: "739278720477-4l1nkb6jq7anu4pacjpu6uc5re384jkj.apps.googleusercontent.com",
      iosClientId: "739278720477-c6lvhnmtvs9ilg6ujsfrp6jhbps93a0h.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
