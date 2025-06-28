# 🔧 Vercel Webhook Troubleshooting

## Common Issues & Quick Fixes

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "No account found"
Run `vercel login` and sign up for free account

### "Error: Cannot find module"
```bash
npm install
```

### Webhook Not Receiving Notifications

1. **Check Pub/Sub subscription status:**
   - Go to Google Cloud Console
   - Pub/Sub → Subscriptions
   - Make sure status is "Active"

2. **Verify webhook URL:**
   - Must be exact: `https://your-project.vercel.app/api/gmail-webhook`
   - No trailing slash
   - HTTPS required (not HTTP)

3. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

### "405 Method Not Allowed"
- Pub/Sub must send POST requests
- Check subscription configuration

### No Logs Appearing
1. Send a test email
2. Wait 10 seconds
3. Check logs: `vercel logs`
4. If still nothing, check Pub/Sub delivery status

### "Invalid message format"
Your Pub/Sub subscription might be misconfigured. Recreate it.

### Gmail Watch Errors

**"Insufficient Permission"**
- Enable Gmail API in Google Cloud Console
- Check OAuth scopes include `gmail.readonly`

**"Topic doesn't exist"**
- Make sure Pub/Sub topic name matches exactly:
  `projects/basic-dispatch-464317-m6/topics/gmail-push-notifications`

### Vercel Deploy Errors

**"Build failed"**
```bash
# Clear cache and retry
rm -rf .vercel
vercel --prod
```

**"Function size exceeded"**
- Remove unnecessary dependencies
- Use `vercel.json` to exclude files

### Email Not Marked as Urgent
The AI might not think it's urgent. Test with obvious urgent subjects:
- "URGENT: Action required"
- "Payment due today"
- "Meeting in 10 minutes"

### Push Notifications Not Working
This requires additional setup:
1. Apple Developer account
2. Push certificates
3. Device tokens
4. Notification service (Firebase/OneSignal)

## Debug Checklist

- [ ] Vercel deployment successful?
- [ ] Webhook URL correct in Pub/Sub?
- [ ] Gmail watch active? (expires every 7 days)
- [ ] Environment variables set in Vercel?
- [ ] Logs showing activity?

## Test Your Setup

1. **Test Pub/Sub delivery:**
   - Go to subscription in Google Console
   - Click "Publish test message"
   - Check Vercel logs

2. **Test full flow:**
   - Send email to yourself
   - Check Vercel logs within 10 seconds
   - Should see "Gmail notification received"

## Still Stuck?

1. **Check Vercel Status:** https://vercel.com/status
2. **Clear everything and restart:**
   ```bash
   rm -rf .vercel node_modules
   npm install
   vercel
   ```
3. **Verify all APIs enabled in Google Cloud Console:**
   - Gmail API
   - Cloud Pub/Sub API

## Success Indicators

You know it's working when:
- ✅ `vercel logs` shows "Gmail notification received"
- ✅ Emails arrive → logs update within 5 seconds
- ✅ AI analysis results appear in logs
- ✅ Urgent emails show "🚨 Urgent email detected!"

## Pro Tips

- Use `vercel dev` for local testing
- Add console.logs for debugging
- Check function duration (must be < 10s)
- Monitor usage in Vercel dashboard

Remember: The free tier is generous - you won't hit limits during testing!