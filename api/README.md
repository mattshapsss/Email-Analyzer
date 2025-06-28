# Vercel API Functions

This directory contains serverless functions that run on Vercel's edge network.

## Available Webhooks

### `/api/gmail-webhook`
Basic webhook that receives Gmail push notifications via Google Pub/Sub.
- Acknowledges receipt of notifications
- Logs basic information
- Always returns 200 OK to keep Pub/Sub happy

### `/api/gmail-webhook-complete` 
Full implementation with AI analysis:
- Receives Gmail push notifications
- Fetches the actual email content
- Analyzes with Gemini AI for urgency
- Prepares push notification payload
- Only sends notifications for urgent emails

## Local Development

To test webhooks locally:
```bash
vercel dev
```

Your webhook will be available at:
```
http://localhost:3000/api/gmail-webhook
```

## Environment Variables

Required in Vercel dashboard:
- `GEMINI_API_KEY` - Your Google Gemini API key
- `GMAIL_ACCESS_TOKEN` - Gmail OAuth token (temporary for testing)

## Deployment

Deploy to production:
```bash
vercel --prod
```

## Webhook URL Format

After deployment, your webhook URL will be:
```
https://[your-project].vercel.app/api/[function-name]
```

## Testing with curl

Test your webhook locally:
```bash
curl -X POST http://localhost:3000/api/gmail-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "data": "eyJlbWFpbEFkZHJlc3MiOiJ0ZXN0QGdtYWlsLmNvbSIsImhpc3RvcnlJZCI6IjEyMzQ1In0="
    }
  }'
```

## Pub/Sub Message Format

Google Pub/Sub sends messages in this format:
```json
{
  "message": {
    "data": "base64-encoded-json",
    "messageId": "1234567890",
    "publishTime": "2024-01-01T00:00:00Z"
  }
}
```

The decoded data contains:
```json
{
  "emailAddress": "user@gmail.com",
  "historyId": "12345"
}
```