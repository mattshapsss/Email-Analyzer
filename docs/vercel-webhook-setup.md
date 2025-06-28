# Vercel Webhook Setup Guide (100% FREE)

## Why Vercel?
- **FREE tier includes 100GB bandwidth/month** (way more than needed)
- **Serverless functions included FREE** (perfect for webhooks)
- **No credit card required**
- **Auto-scaling built in**
- **Works perfectly with Gmail Push API**

## How It Works
1. Gmail detects new email → Publishes to Pub/Sub
2. Pub/Sub → Calls your Vercel webhook URL
3. Webhook → Analyzes email with Gemini AI
4. If urgent → Sends push notification to your iPhone

## Step-by-Step Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Create Vercel Account (FREE)
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended) or email
3. No credit card needed!

### 3. Deploy Your Webhook
From your project directory:
```bash
vercel
```

Follow the prompts:
- Login/Sign up if needed
- Set up and deploy: Yes
- Which scope? (select your account)
- Link to existing project? No
- Project name? email-analyzer-webhook
- Directory? ./ (current directory)
- Overwrites? Yes

### 4. Get Your Webhook URL
After deployment, Vercel gives you URLs like:
```
https://email-analyzer-webhook.vercel.app
```

Your webhook endpoint will be:
```
https://email-analyzer-webhook.vercel.app/api/gmail-webhook
```

### 5. Configure Google Pub/Sub Subscription
Back in Google Cloud Console:

1. Go to Pub/Sub → Subscriptions
2. Click "CREATE SUBSCRIPTION"
3. Fill in:
   - Subscription ID: `gmail-push-subscription`
   - Topic: Select your existing `gmail-push-notifications` topic
   - Delivery type: **Push**
   - Endpoint URL: `https://your-project.vercel.app/api/gmail-webhook`
   - Leave other settings as default
4. Click "CREATE"

### 6. Test Your Webhook
Send yourself a test email and check Vercel logs:
```bash
vercel logs
```

## What Happens Next?

When someone sends you an email:
1. Gmail instantly notifies Pub/Sub (< 1 second)
2. Pub/Sub calls your Vercel webhook (< 1 second)
3. Webhook analyzes with Gemini AI (< 2 seconds)
4. If urgent, sends push to your iPhone (< 1 second)
**Total time: ~3-5 seconds from email sent to notification!**

## Vercel Free Tier Limits
- **Bandwidth**: 100 GB/month (each webhook call ~1KB = 100 million emails!)
- **Serverless Function Executions**: 100,000/month
- **Function Duration**: 10 seconds max (plenty for our needs)
- **No credit card required**

## Environment Variables in Vercel
Add these in Vercel dashboard (Settings → Environment Variables):
```
GEMINI_API_KEY=your-gemini-api-key
PUSH_NOTIFICATION_URL=your-ios-push-endpoint
```

## Advanced: Custom Domain (Optional)
You can add a custom domain for free:
1. Buy domain (e.g., from Namecheap ~$10/year)
2. Add to Vercel project settings
3. Update DNS records
4. Now webhook is: `https://yourdomain.com/api/gmail-webhook`

## Monitoring Your Webhook
1. **Vercel Dashboard**: See all function calls, errors, logs
2. **Real-time logs**: `vercel logs --follow`
3. **Function metrics**: Free analytics in dashboard

## Troubleshooting
- **"Method not allowed"**: Make sure Pub/Sub is sending POST requests
- **No logs appearing**: Check subscription is active in Google Console
- **Timeout errors**: Increase maxDuration in vercel.json (max 10s on free)

## Next Steps
After webhook is working:
1. Implement Gemini AI analysis in webhook
2. Add iOS push notification sending
3. Store important emails for offline access
4. Add webhook authentication for security

## Cost Breakdown
- Vercel webhook: **$0** (free tier)
- Google Pub/Sub: **$0** (free tier: 10GB/month)
- Gmail API: **$0** (free tier)
- Gemini API: **$0** (60 requests/min free)
- **Total monthly cost: $0**

The only cost is your Apple Developer account ($99/year) for push notifications!