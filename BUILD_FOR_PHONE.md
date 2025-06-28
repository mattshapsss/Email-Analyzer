# 📱 Build for Your iPhone

Since you're already logged in, let's get the app on your phone!

## Option 1: Using Xcode (Easier)

### Step 1: Navigate to project
```bash
cd /Users/mattshapiro/Desktop/samson\'s/email-analyzer
```

### Step 2: Add iOS platform
```bash
npx cap add ios
```

### Step 3: Sync the build
```bash
npx cap sync ios
```

### Step 4: Open in Xcode
```bash
npx cap open ios
```

### Step 5: In Xcode
1. Connect your iPhone via USB
2. Select your device from the device list (top bar)
3. Click the Play button to build and run
4. Trust the developer certificate on your phone:
   - Settings → General → Device Management → Developer App → Trust

## Option 2: Build IPA for AltStore

If you want to use AltStore instead:

### Step 1: After opening in Xcode
1. Select "Any iOS Device" as target
2. Go to Product → Archive
3. Once archived, click "Distribute App"
4. Choose "Development"
5. Export the .ipa file

### Step 2: Install via AltStore
1. Open AltStore on your phone
2. Tap "My Apps"
3. Tap "+" and select your .ipa file
4. App installs and refreshes every 7 days

## What Will Work on Your Phone:

✅ **Working Now:**
- Gmail sign in (you're already logged in!)
- Email fetching and display
- AI analysis of emails
- Gmail push notifications set up
- Beautiful iOS 18 dark mode UI

⏳ **Not Yet Working:**
- Actual push notifications to your phone (need Apple certificates)
- Background refresh (need to configure in Xcode)

## Quick Test Once Installed:

1. Open the app
2. You should see "Email Analyzer Active" 
3. Send yourself an email
4. Pull to refresh - email should appear
5. Check Vercel logs to see webhook activity

The app will work great for testing! Push notifications need Apple Developer account ($99/year) to work on device.