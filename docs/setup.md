# Email Analyzer Setup Guide

## Prerequisites

- macOS with Xcode installed
- Node.js 18+ and npm
- iOS device for testing (push notifications don't work in simulator)
- Google Cloud Console account
- AltStore installed on iOS device

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd email-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install global CLI tools**
   ```bash
   npm install -g @ionic/cli @capacitor/cli
   ```

## Environment Configuration

1. **Create `.env.local` file in project root**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your API keys to `.env.local`**
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   REACT_APP_GOOGLE_CLIENT_SECRET=your_client_secret
   REACT_APP_REDIRECT_URI=com.emailanalyzer.app://oauth
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```

## Google Cloud Setup

1. **Create a new project in Google Cloud Console**

2. **Enable required APIs**
   - Gmail API
   - Google+ API (for OAuth)

3. **Create OAuth 2.0 credentials**
   - Application type: iOS
   - Bundle ID: com.emailanalyzer.app
   - Add redirect URI: com.emailanalyzer.app://oauth

4. **Download credentials**
   - Save as `google-services.json` in project root

## iOS Development Setup

1. **Build the project**
   ```bash
   npm run build
   ionic cap sync ios
   ```

2. **Open in Xcode**
   ```bash
   ionic cap open ios
   ```

3. **Configure signing**
   - Select your development team
   - Ensure bundle ID matches: com.emailanalyzer.app

4. **Enable capabilities**
   - Push Notifications
   - Background Modes (Background fetch, Remote notifications)

## Running the App

### Development (Browser)
```bash
ionic serve
```

### iOS Simulator
```bash
ionic cap run ios
```

### iOS Device
1. Connect device via USB
2. Select device in Xcode
3. Click Run

## Troubleshooting

### Common Issues

1. **OAuth redirect not working**
   - Ensure URL scheme is added to Info.plist
   - Check REVERSED_CLIENT_ID is correct

2. **Push notifications not working**
   - Must test on physical device
   - Check certificates in Apple Developer Portal
   - Ensure capabilities are enabled

3. **Build failures**
   - Run `ionic cap sync ios` after dependency changes
   - Clean build folder in Xcode

4. **API quota exceeded**
   - Gmail API: 250 quota units per user per second
   - Gemini API: Check free tier limits

## Next Steps

- See [API Configuration Guide](./api-config.md) for detailed API setup
- See [Deployment Guide](./deployment.md) for AltStore distribution