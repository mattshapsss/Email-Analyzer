# API Configuration Guide

## Google OAuth2 Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Note your project ID

### 2. Enable APIs

Enable the following APIs in your project:
- Gmail API
- Google+ API

```bash
gcloud services enable gmail.googleapis.com
gcloud services enable plus.googleapis.com
```

### 3. Create OAuth2 Credentials

1. Navigate to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen:
   - User Type: External
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

4. Create OAuth client:
   - Application type: iOS
   - Bundle ID: `com.emailanalyzer.app`
   - URL scheme: Copy the REVERSED_CLIENT_ID

### 4. Configure iOS URL Scheme

Add to `ios/App/App/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

## Gemini API Setup

### 1. Get API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Note: Free tier limits:
   - 60 requests per minute
   - 1,500 requests per day

### 2. Configure in App

Add to `.env.local`:
```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Usage Limits

Monitor usage to stay within free tier:
- Max 30 emails analyzed per day
- Batch analysis recommended
- Cache results for 30 minutes

## Security Best Practices

### 1. Environment Variables

Never commit `.env.local` file. Use `.env.local.example`:
```
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_CLIENT_SECRET=your_secret_here
REACT_APP_REDIRECT_URI=com.emailanalyzer.app://oauth
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

### 2. Token Storage

Tokens are stored securely using:
- iOS: Keychain Services
- Encryption: Hardware-backed when available

### 3. API Key Restrictions

In Google Cloud Console:
- Restrict API keys to specific APIs
- Add iOS app restrictions with bundle ID
- Enable only required OAuth scopes

## Testing OAuth Flow

### 1. Local Testing

For development, use web OAuth flow:
```javascript
const redirectUri = isDevelopment 
  ? 'http://localhost:8100/oauth/callback'
  : 'com.emailanalyzer.app://oauth';
```

### 2. Device Testing

1. Ensure URL scheme is registered
2. Test with:
   ```javascript
   await GoogleAuth.signIn();
   ```

### 3. Token Refresh

Tokens auto-refresh before expiry:
```javascript
if (Date.now() >= tokens.expiresAt - 300000) {
  await gmailService.refreshAccessToken();
}
```

## Troubleshooting

### Common OAuth Issues

1. **"redirect_uri_mismatch" error**
   - Verify URL scheme in Info.plist
   - Check OAuth client configuration
   - Ensure bundle ID matches

2. **"invalid_client" error**
   - Client secret not needed for iOS
   - Use correct client ID format

3. **Scope errors**
   - Request minimal required scopes
   - Add scopes incrementally

### API Quota Issues

1. **Gmail API quota exceeded**
   - Implement exponential backoff
   - Cache email data locally
   - Batch requests when possible

2. **Gemini API limits**
   - Queue analysis requests
   - Implement rate limiting
   - Use caching effectively

## Production Checklist

- [ ] Remove all console.log statements
- [ ] Enable API key restrictions
- [ ] Test token refresh flow
- [ ] Verify offline functionality
- [ ] Monitor API usage metrics
- [ ] Set up error reporting
- [ ] Test on multiple iOS versions