# Email Analyzer iOS App

## Project Overview
Native iOS application distributed via AltStore for real-time Gmail analysis using Google Gemini AI.
Instant push notifications when emails arrive, with AI-powered urgency detection.
iOS 18 (June 2025) design language with dark mode as primary theme.

## Core Value Proposition
- Get notified INSTANTLY when important emails arrive (not just any email)
- AI determines if action is needed and urgency level
- Beautiful, minimal interface - "it just works"
- No email management - purely notification intelligence

## Core Requirements
- **Platform**: iOS via AltStore (7-day refresh cycle)
- **Stack**: Ionic React + TypeScript + Capacitor
- **APIs**: Gmail OAuth2 + Google Gemini (free tier)
- **Features**: Push notifications, offline mode, background refresh

## Technical Architecture
- **Frontend**: Ionic React + TypeScript (strict mode)
- **Real-time**: Gmail Push API → Pub/Sub → Webhook → Instant notification
- **Storage**: Capacitor Preferences (iOS Keychain)
- **Authentication**: OAuth2 with dual client setup (Web/iOS)
- **AI Model**: Gemini 1.5 Flash (free tier, 60 req/min)
- **Webhook**: Vercel Functions (free tier)

## API Integration Status
- **Gmail OAuth2**: ✅ Working (Web client for dev, iOS for production)
- **Gmail Push API**: ✅ Pub/Sub topic created, awaiting webhook
- **Gemini API**: ✅ Working - smart action/urgency detection
- **Pub/Sub Permissions**: ✅ Gmail has publish access
- **Environment Variables**: ✅ All configured in .env.local

## Current API Keys (DO NOT COMMIT)
- Web Client ID: 739278720477-4l1nkb6jq7anu4pacjpu6uc5re384jkj
- iOS Client ID: 739278720477-c6lvhnmtvs9ilg6ujsfrp6jhbps93a0h
- Gemini API: Configured in .env.local
- Pub/Sub Topic: projects/basic-dispatch-464317-m6/topics/gmail-push-notifications

## Code Standards
- TypeScript strict mode enabled
- 2-space indentation
- Functional components with hooks
- Comprehensive error handling
- No console.logs in production
- All API calls wrapped in try-catch

## Project Structure
```
email-analyzer/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── services/       # API and business logic
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript interfaces
│   └── utils/          # Helper functions
├── ios/                # iOS native code
├── docs/               # Documentation
├── capacitor.config.ts # Capacitor configuration
└── .env.local         # Environment variables (DO NOT COMMIT)
```

## Key Commands
```bash
# Development
ionic serve              # Run in browser
ionic cap sync          # Sync web to native

# iOS Build
ionic build             # Build web assets
ionic cap sync ios      # Sync to iOS
ionic cap open ios      # Open in Xcode

# Testing
npm test               # Run tests
npm run lint           # Lint code
npm run typecheck      # TypeScript check
```

## iOS Configuration
- Bundle ID: com.emailanalyzer.app
- Display Name: Email Analyzer
- Version: 1.0.0
- Minimum iOS: 13.0
- Capabilities: Push Notifications, Background Fetch

## Security Requirements
- Never commit API keys or secrets
- Use secure storage for OAuth tokens
- Implement token refresh before expiry
- Clear sensitive data on logout
- Use HTTPS for all API calls

## UI/UX Guidelines (iOS 18 - June 2025)
- **Typography**: SF Pro Display/Text with proper weights
- **Colors**: System semantic colors with dark mode support
- **Spacing**: 8pt grid system (8, 16, 24, 32, 48)
- **Animations**: Spring curves with 350ms duration
- **Components**: Native iOS-style cards, lists, buttons
- **Minimum touch targets**: 44pt
- **Dark mode**: Primary theme with pure blacks
- **Design principle**: Less is more, Apple-quality polish

## Deployment
- Build .ipa for AltStore distribution
- Web backup on Netlify
- Version tagging for releases
- Test on real iOS devices

## Testing Approach
- Unit tests for services
- Component testing for UI
- Integration tests for API calls
- Manual testing on iOS device
- Background task verification

## Performance Targets
- App launch: < 2 seconds
- Email fetch: < 3 seconds
- AI analysis: < 5 seconds per email
- Offline mode: instant
- Background refresh: every 30 minutes

## Current Implementation Status
- ✅ Gmail OAuth working (fetches & displays emails)
- ✅ Gemini AI analysis (detects urgency/actions)
- ✅ Basic functional UI
- ✅ Pub/Sub topic configured
- ✅ iOS 18 dark mode UI started
- 🔄 Webhook endpoint needed (Vercel)
- ⏳ Gmail watch() API call pending
- ⏳ iOS build & push notifications pending

## Immediate Next Steps
1. ✅ Deploy Vercel webhook function (free tier) - READY TO DEPLOY
2. Call Gmail watch() API to start monitoring
3. Complete iOS 18 dark mode UI
4. Implement push notification handler
5. Build .ipa for iOS testing

## Vercel Webhook Status
- ✅ Basic webhook created: `/api/gmail-webhook.ts`
- ✅ Complete webhook with AI: `/api/gmail-webhook-complete.ts`
- ✅ Updated to send notifications for ALL emails (not just urgent)
- ✅ AI-powered analysis with detailed prompting for accuracy
- ✅ Notification format: [URGENCY] Subject + Action Required/No Action + From
- ✅ Enhanced AI prompt with context understanding
- ✅ Test emails provided: `TEST_EMAILS.md`
- ✅ AI explanation: `AI_ANALYSIS_EXPLAINED.md`
- 🔄 Ready to deploy: Run `vercel` in terminal

## How Push Flow Works
1. User signs in → Gmail OAuth
2. App calls watch() → Gmail monitors inbox
3. New email → Gmail publishes to Pub/Sub
4. Pub/Sub → Triggers Vercel webhook
5. Webhook → Fetches email, analyzes with AI
6. If urgent → iOS push notification
7. All happens in ~2 seconds!

## Remember
- App should feel like Apple built it
- Instant notifications are the killer feature
- Dark mode is primary theme
- Less is more - simple but perfect