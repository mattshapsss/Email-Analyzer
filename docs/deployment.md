# AltStore Deployment Guide

## Overview

This guide covers deploying the Email Analyzer app via AltStore, which allows iOS app distribution without the App Store.

## Prerequisites

- macOS with Xcode
- AltServer installed on Mac
- AltStore installed on iOS device
- Apple ID (free or paid)
- iOS device on same network as Mac

## Building the IPA

### 1. Prepare for Production

```bash
# Install dependencies
npm install

# Build production assets
npm run build

# Sync with iOS
ionic cap sync ios
```

### 2. Configure in Xcode

1. Open Xcode project:
   ```bash
   ionic cap open ios
   ```

2. Select "Any iOS Device" as build target

3. Configure signing:
   - Team: Your Apple ID team
   - Bundle ID: com.emailanalyzer.app
   - Signing: Automatic

4. Set build configuration:
   - Product > Scheme > Edit Scheme
   - Run > Build Configuration: Release

### 3. Archive the App

1. Product > Archive
2. Wait for archive to complete
3. In Organizer, select your archive
4. Click "Distribute App"
5. Choose "Development" distribution
6. Export to desired location

### 4. Create IPA from Archive

If Xcode doesn't create IPA directly:
```bash
cd ~/Desktop/ExportedArchive
mkdir Payload
cp -r *.app Payload/
zip -r EmailAnalyzer.ipa Payload
```

## AltStore Distribution

### 1. Local Installation

1. Ensure AltServer is running on Mac
2. Connect iOS device via USB or Wi-Fi
3. Open AltStore on iOS device
4. Tap "+" and select IPA file
5. Enter Apple ID credentials when prompted

### 2. Create AltStore Source

Create `altstore-source.json`:
```json
{
  "name": "Email Analyzer",
  "identifier": "com.emailanalyzer.source",
  "apps": [
    {
      "name": "Email Analyzer",
      "bundleIdentifier": "com.emailanalyzer.app",
      "developerName": "Your Name",
      "version": "1.0.0",
      "versionDate": "2024-12-28",
      "versionDescription": "Initial release",
      "downloadURL": "https://your-server.com/EmailAnalyzer.ipa",
      "localizedDescription": "AI-powered email analysis and action tracking",
      "iconURL": "https://your-server.com/icon.png",
      "tintColor": "3478F6",
      "size": 10485760,
      "screenshotURLs": [
        "https://your-server.com/screenshot1.png",
        "https://your-server.com/screenshot2.png"
      ]
    }
  ]
}
```

### 3. Host Distribution Files

Upload to web server:
- `EmailAnalyzer.ipa`
- `altstore-source.json`
- App icon and screenshots

### 4. Add Source to AltStore

1. In AltStore, go to Browse
2. Tap "+" to add source
3. Enter source URL: `https://your-server.com/altstore-source.json`

## Important Considerations

### 7-Day Refresh Cycle

- Apps installed via AltStore expire after 7 days
- Must refresh while connected to same network as AltServer
- AltStore sends notification before expiry

### Free Apple ID Limitations

- Maximum 3 apps at once
- 10 app IDs per 7 days
- Apps must be refreshed weekly

### Handling Expiration

Add to app:
```typescript
async function checkAppExpiration() {
  const installDate = await getInstallDate();
  const daysSinceInstall = differenceInDays(new Date(), installDate);
  
  if (daysSinceInstall >= 6) {
    showExpirationWarning();
  }
}
```

## Web Backup (Netlify)

### 1. Prepare Web Build

```bash
# Build for web
npm run build

# Files are in dist/
```

### 2. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### 3. Configure Headers

Create `dist/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

### 4. Environment Variables

Set in Netlify dashboard:
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_GEMINI_API_KEY`

## Troubleshooting

### IPA Installation Issues

1. **"Unable to install" error**
   - Check bundle ID matches
   - Verify signing certificate
   - Ensure device UDID is registered

2. **App crashes on launch**
   - Check for missing capabilities
   - Verify all plugins are included
   - Test in Xcode debugger

3. **Refresh failures**
   - Ensure on same network
   - Check AltServer is running
   - Try USB connection

### Optimization Tips

1. **Reduce IPA size**
   ```bash
   # Remove unused assets
   find . -name "*.map" -delete
   
   # Optimize images
   imageoptim ios/App/App/Assets.xcassets
   ```

2. **Enable ProGuard** (if applicable)

3. **Remove development dependencies**

## Version Management

1. Update version in:
   - `package.json`
   - `ios/App/App.xcodeproj`
   - `altstore-source.json`

2. Tag releases:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```

## Success Checklist

- [ ] IPA builds successfully
- [ ] App installs via AltStore
- [ ] Push notifications work
- [ ] OAuth flow completes
- [ ] Offline mode functions
- [ ] 7-day refresh reminder appears
- [ ] Web backup accessible