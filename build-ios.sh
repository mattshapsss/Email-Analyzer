#!/bin/bash

echo "🚀 Building Email Analyzer for iOS..."

# Build the web assets
echo "📦 Building web assets..."
npm run build

# Add iOS platform if not exists
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
fi

# Sync with iOS
echo "🔄 Syncing with iOS..."
npx cap sync ios

# Open in Xcode
echo "🎯 Opening Xcode..."
npx cap open ios

echo "✅ Done! Xcode should now be open."
echo ""
echo "To run on your phone:"
echo "1. Connect your iPhone via USB"
echo "2. Select your phone from the device dropdown"
echo "3. Click the Play button"
echo "4. Trust the app in Settings → General → Device Management"