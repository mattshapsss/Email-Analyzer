# 🚀 Vercel Webhook Quick Setup (5 minutes)

## What You'll Get
- **Instant email notifications** (3-5 seconds from email arrival)
- **100% FREE** (no credit card needed)
- **Works immediately**

## Prerequisites Done ✅
- Gmail Push API configured
- Pub/Sub topic created
- Webhook code ready in `/api/gmail-webhook.ts`

## Quick Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Deploy to Vercel
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Select your username
- **Link to existing project?** → N
- **Project name?** → email-analyzer-webhook (or press enter)
- **Directory?** → ./ (press enter)
- **Override settings?** → N

### 4. Copy Your Webhook URL
Vercel will show:
```
✅ Production: https://email-analyzer-webhook-xxx.vercel.app
```

Your webhook URL is:
```
https://email-analyzer-webhook-xxx.vercel.app/api/gmail-webhook
```

### 5. Connect to Google Pub/Sub
1. Go to: https://console.cloud.google.com/cloudpubsub/subscription
2. Click "CREATE SUBSCRIPTION"
3. Settings:
   - **Subscription ID**: gmail-push-subscription
   - **Select a Cloud Pub/Sub topic**: gmail-push-notifications
   - **Delivery type**: Push
   - **Endpoint URL**: [Your Vercel webhook URL from step 4]
4. Click "CREATE"

### 6. Test It!
1. Send yourself an email
2. Check Vercel logs:
```bash
vercel logs --follow
```

You should see: "Gmail notification received" within 5 seconds!

## That's It! 🎉
Your webhook is live and receiving Gmail notifications in real-time.

## What's Next?
The webhook currently:
- ✅ Receives instant Gmail notifications
- ✅ Decodes the Pub/Sub message
- ⏳ TODO: Analyze with Gemini AI
- ⏳ TODO: Send iOS push notifications

## Useful Commands
```bash
vercel logs          # View recent logs
vercel logs --follow # Watch logs in real-time
vercel --prod        # Deploy updates
```

## FREE Limits (More Than Enough)
- 100,000 function calls/month
- 100 GB bandwidth/month
- No time limits
- No credit card required