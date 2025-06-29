#!/bin/bash

echo "🔧 Fixing Xcode project..."

# Remove existing iOS folder
echo "📱 Removing old iOS files..."
rm -rf ios

# Clear Capacitor cache
echo "🗑️  Clearing cache..."
rm -rf node_modules/.cache
rm -rf .capacitor

# Add iOS platform fresh
echo "📱 Adding iOS platform..."
npx cap add ios

# Sync the project
echo "🔄 Syncing project..."
npx cap sync ios

# Install pods
echo "📦 Installing CocoaPods dependencies..."
cd ios/App && pod install && cd ../..

# Open in Xcode
echo "🚀 Opening in Xcode..."
open ios/App/App.xcworkspace -a Xcode

echo "✅ Done! Xcode should now show your project correctly."
echo ""
echo "If you still see 'No Editor':"
echo "1. Press Cmd+1 to show Project Navigator"
echo "2. Click on 'App' folder in the navigator"
echo "3. Click on any .swift file"