# 📱 Step-by-Step Vercel Setup

## What You'll Get
Every email will trigger a notification showing:
- **[HIGH]** or **[MEDIUM]** or **[LOW]** urgency in the title
- Subject line
- "Action Required" or "No Action Needed"
- AI-generated action summary (if action needed)
- Who it's from

Example notification:
```
[HIGH] Meeting invite from John Smith
Action Required
Accept or decline meeting for tomorrow 2pm
From: John Smith
```

## Step 1: Install Dependencies
In your terminal, make sure you're in the email-analyzer directory:
```bash
cd /Users/mattshapiro/Desktop/samson\'s/email-analyzer
npm install
```

## Step 2: Install Vercel CLI Globally
```bash
npm install -g vercel
```

## Step 3: Login to Vercel (FREE)
```bash
vercel login
```
- It will ask for your email
- Check your email for verification link
- Click the link to verify

## Step 4: Deploy Your Webhook
```bash
vercel
```

You'll see these questions - here's what to answer:

1. **Set up and deploy?** → Type `y` and press Enter
2. **Which scope?** → Select your username (use arrow keys)
3. **Link to existing project?** → Type `n` and press Enter
4. **What's your project's name?** → Just press Enter (accepts default)
5. **In which directory is your code?** → Type `./` and press Enter
6. **Want to override settings?** → Type `n` and press Enter

## Step 5: Copy Your Webhook URL
Vercel will show something like:
```
✅ Production: https://email-analyzer-abc123.vercel.app [copied to clipboard]
```

Your webhook URL is:
```
https://email-analyzer-abc123.vercel.app/api/gmail-webhook-complete
```
(Note: Add `/api/gmail-webhook-complete` to the end!)

## Step 6: Create Google Pub/Sub Subscription

1. Open new browser tab
2. Go to: https://console.cloud.google.com/cloudpubsub/subscription
3. Click blue "CREATE SUBSCRIPTION" button
4. Fill in these fields:
   - **Subscription ID**: `gmail-push-subscription`
   - **Select a Cloud Pub/Sub topic**: Click dropdown → Select `gmail-push-notifications`
   - **Delivery type**: Click "Push" (not Pull)
   - **Endpoint URL**: Paste your webhook URL from Step 5
   - Leave everything else default
5. Click "CREATE" at bottom

## Step 7: Activate Gmail Watch
Go back to your app in the browser (http://localhost:8100) and the Dashboard should activate Gmail watch automatically.

## Step 8: Test It!
1. Send yourself an email from another account
2. Watch the logs in your terminal:
```bash
vercel logs --follow
```

Within 5 seconds you should see:
```
📧 New Gmail notification
🤖 Analyzing email with AI...
📊 AI Analysis: { urgencyLevel: "medium", requiresAction: true ... }
📱 Push notification payload: { title: "[MEDIUM] Test email", body: "Action Required..." }
```

## Step 9: Add Environment Variables (Important!)

1. Go to: https://vercel.com/dashboard
2. Click on your `email-analyzer` project
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar
5. Add these variables:

   **GEMINI_API_KEY**
   - Value: `AIzaSyAj8RTUllSSbunI5NcIt4Cwihggxv2s-Bw`
   - Click "Add"

   **GMAIL_ACCESS_TOKEN** (temporary for testing)
   - You'll need to get this from your app
   - For now, skip this

6. After adding, redeploy:
```bash
vercel --prod
```

## 🎉 That's It! You're Live!

Your webhook is now:
- Receiving real-time Gmail notifications
- Analyzing EVERY email with AI
- Determining urgency and required actions
- Preparing push notifications for ALL emails

## Notification Examples

**High Urgency + Action:**
```
[HIGH] Payment overdue - Final notice
Action Required
Pay invoice #1234 immediately to avoid service interruption
From: Billing Department
```

**Low Urgency + No Action:**
```
[LOW] Newsletter: Tech tips for December
No Action Needed
From: TechCrunch
```

**Medium Urgency + Action:**
```
[MEDIUM] Please review pull request #42
Action Required  
Review and merge frontend updates
From: GitHub
```

## Troubleshooting

**Not seeing logs?**
- Make sure you sent email to the right account
- Check Pub/Sub subscription is "Active"
- Try `vercel logs` (without --follow) to see recent logs

**"Invalid message format"?**
- Webhook URL must end with `/api/gmail-webhook-complete`
- Not `/api/gmail-webhook` (that's the basic version)

**Still not working?**
- Run `vercel` again to redeploy
- Make sure Gmail watch is active (check Dashboard)
- Send test email with obvious subject like "URGENT: Test"

## What's Next?
The webhook is ready! Next steps:
1. Set up iOS push certificates
2. Connect to push service (OneSignal/Firebase)
3. Build iOS app
4. Receive real notifications on your phone!