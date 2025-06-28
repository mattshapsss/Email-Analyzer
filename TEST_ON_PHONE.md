# 📱 Test on Your Phone - Quick Guide

Since you're already logged in from before, here's what will happen:

## When You Open the App on Your Phone:

1. **App launches** → Checks for saved login
2. **Finds your tokens** → Shows "Email Analyzer Active"
3. **Automatically**:
   - Sets up Gmail watch (if not already)
   - Starts monitoring your inbox
   - Shows your recent emails

## Quick Build Commands:

```bash
cd /Users/mattshapiro/Desktop/samson\'s/email-analyzer
./build-ios.sh
```

Or manually:
```bash
cd /Users/mattshapiro/Desktop/samson\'s/email-analyzer
npx cap add ios
npx cap sync ios
npx cap open ios
```

## In Xcode:
1. **Plug in your iPhone**
2. **Select your phone** from device list
3. **Hit Play button**
4. **Trust the app** on your phone (Settings → General → Device Management)

## What You'll See:

### On Your Phone:
- ✅ Dark mode dashboard
- ✅ "Email Analyzer Active" with green checkmark
- ✅ Your email address
- ✅ Email count and urgent count
- ✅ Pull to refresh for new emails

### In Vercel Logs:
When you receive an email:
```
📧 New Gmail notification
🤖 Analyzing email with AI...
📱 Push notification payload ready
```

## Testing Flow:

1. **Open app on phone**
2. **Confirm you see "Active" status**
3. **Send yourself a test email** with subject "URGENT: Test from phone"
4. **Check Vercel logs**:
   ```bash
   vercel logs https://email-analyzer-agix6eg34-matthews-projects-1429af0d.vercel.app
   ```
5. **Pull to refresh** in app - new email should appear

## Current Status:
- ✅ Gmail API working
- ✅ AI analysis working
- ✅ Webhook receiving notifications
- ✅ Beautiful UI
- ⏳ Push to phone (needs Apple certs)

The app is fully functional for testing! You just won't get actual iOS push notifications without Apple Developer account.