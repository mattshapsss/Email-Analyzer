# 🚀 Deploy to Vercel NOW - 5 Minutes!

## Step 1: Open Terminal
```bash
cd /Users/mattshapiro/Desktop/samson\'s/email-analyzer
```

## Step 2: Run Vercel
```bash
vercel
```

## Step 3: Answer These Questions:

1. **Vercel CLI 44.2.7**
   > Set up and deploy "/Users/mattshapiro/Desktop/samson's/email-analyzer"?
   
   **Type:** `y` (press Enter)

2. **Which scope do you want to deploy to?**
   
   **Select:** Your username (use arrow keys, press Enter)

3. **Link to existing project?**
   
   **Type:** `n` (press Enter)

4. **What's your project's name?**
   
   **Just press Enter** (accepts default: email-analyzer)

5. **In which directory is your code located?**
   
   **Type:** `./` (press Enter)

6. **Want to modify these settings?**
   
   **Type:** `n` (press Enter)

## Step 4: Wait for Deploy (2-3 minutes)

You'll see:
```
🔍 Inspect: https://vercel.com/yourname/email-analyzer/abc123
✅ Production: https://email-analyzer-abc123.vercel.app [copied]
```

## Step 5: Copy Your Webhook URL

Take the production URL and add `/api/gmail-webhook-complete`:
```
https://email-analyzer-abc123.vercel.app/api/gmail-webhook-complete
```

## Step 6: Add to Google Pub/Sub

1. Open new browser tab
2. Go to: https://console.cloud.google.com/cloudpubsub/subscription
3. Click "CREATE SUBSCRIPTION"
4. Fill in:
   - **Subscription ID:** `gmail-push-subscription`
   - **Topic:** Select `gmail-push-notifications` from dropdown
   - **Delivery type:** Push (not Pull!)
   - **Endpoint URL:** Paste your webhook URL from Step 5
5. Click "CREATE"

## Step 7: Test It!

1. Send yourself an email
2. In terminal, watch logs:
```bash
vercel logs --follow
```

You should see within 5 seconds:
```
📧 New Gmail notification
🤖 Analyzing email with AI...
📊 AI Analysis: { urgencyLevel: "medium", requiresAction: true ... }
📱 Push notification payload: [MEDIUM] Your test email...
```

## That's It! 🎉

Your webhook is now:
- ✅ Live on the internet
- ✅ Receiving Gmail notifications
- ✅ Analyzing with AI
- ✅ Ready for ALL emails

Total time: ~5 minutes
Cost: $0