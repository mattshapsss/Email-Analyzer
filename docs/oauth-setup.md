# OAuth Setup for User Gmail Access

## Overview
This app uses OAuth2 to let users connect their own Gmail accounts. Each user authenticates with their Google account, and the app only accesses their emails with their permission.

## Google Cloud Console Setup

### 1. Create OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "APIs & Services" → "OAuth consent screen"
4. Configure:
   - **User Type**: External (allows any Google user)
   - **App Name**: Email Analyzer
   - **User Support Email**: Your email
   - **Developer Contact**: Your email
   - **Logo**: Upload your app logo (optional)

### 2. Add OAuth Scopes
Add these scopes (they show what permissions users will grant):
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/userinfo.email` - See email address
- `https://www.googleapis.com/auth/userinfo.profile` - See basic profile

### 3. Create iOS OAuth Client
1. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
2. Application type: **iOS**
3. Bundle ID: `com.emailanalyzer.app`
4. App Store ID: (leave empty for now)
5. Team ID: (optional)
6. Click "Create"
7. **Copy the Client ID** - this is what you need!

### 4. Configure iOS URL Scheme
The iOS client will give you a "iOS URL scheme" (looks like `com.googleusercontent.apps.XXXXX`).

Add this to your app's Info.plist:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_IOS_URL_SCHEME_HERE</string>
        </array>
    </dict>
</array>
```

## Environment Variables

Create `.env.local` in your project root:
```bash
# Google OAuth (iOS Client ID - NO SECRET NEEDED!)
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com

# Gemini API (your key that all users share)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

## How It Works

1. **User Opens App** → Sees "Sign in with Google" button
2. **User Taps Sign In** → Google OAuth screen appears
3. **User Approves** → Grants permission to read their emails
4. **App Receives Tokens** → Stores securely in iOS Keychain
5. **App Fetches Emails** → Uses user's token to access their Gmail

## Security Notes

- **No Client Secret**: iOS apps don't use client secrets (they can't be kept secret in mobile apps)
- **User Tokens**: Each user's OAuth tokens are stored securely in iOS Keychain
- **Token Refresh**: Tokens auto-refresh before expiring
- **Logout**: Clears all stored tokens and cached data

## Testing OAuth Flow

### Development (Web)
```bash
ionic serve
# Click "Sign in with Google"
# Note: Full OAuth only works on device
```

### iOS Device
```bash
ionic cap run ios
# Test full OAuth flow
# Verify tokens are stored
# Check email access works
```

## Publishing Requirements

Before publishing to App Store/AltStore:
1. ✅ Verify OAuth consent screen is configured
2. ✅ Add privacy policy URL to consent screen
3. ✅ Add terms of service URL (if applicable)
4. ✅ Request verification if accessing sensitive scopes
5. ✅ Test with multiple Google accounts

## Common Issues

**"redirect_uri_mismatch"**
- Ensure iOS URL scheme matches exactly
- Check bundle ID in Xcode matches OAuth client

**"access_denied"**
- User declined permissions
- Show clear explanation of why you need email access

**"invalid_client"**
- Wrong client ID
- Using web client ID instead of iOS client ID

## Rate Limits

- Gmail API: 250 quota units per user per second
- No hard limit on emails fetched (but be reasonable)
- Implement pagination for large inboxes