# 📧 Test Emails to Try

Send these to yourself to see how the AI analyzes different types:

## High Urgency Tests

### 1. Server Emergency
```
Subject: URGENT: Database server is down
Body: The production database is not responding. All services are affected. Please investigate immediately.
```
Expected: [HIGH] Action Required - Investigate and fix database server

### 2. Payment Overdue
```
Subject: Final Notice - Payment Due Today
Body: Your account is past due. Please pay $99.99 by end of day today to avoid service interruption.
```
Expected: [HIGH] Action Required - Pay $99.99 today to avoid service interruption

### 3. Meeting Starting
```
Subject: Meeting starting in 10 minutes
Body: Quick reminder - our project sync is starting at 2pm (in 10 minutes). Zoom link: [link]
```
Expected: [HIGH] Action Required - Join Zoom meeting starting in 10 minutes

## Medium Urgency Tests

### 4. Document Review
```
Subject: Please review Q4 budget proposal
Body: Hi, I've attached the Q4 budget for your review. Please send feedback by end of week. Thanks!
```
Expected: [MEDIUM] Action Required - Review Q4 budget and provide feedback by end of week

### 5. Meeting Invite
```
Subject: Team Planning Session - Next Tuesday
Body: Let's meet Tuesday at 3pm to discuss Q1 goals. Please confirm if this works for you.
```
Expected: [MEDIUM] Action Required - Confirm availability for Tuesday 3pm meeting

## Low Urgency Tests

### 6. Newsletter
```
Subject: TechCrunch Daily: Latest AI News
Body: Today's top stories: OpenAI announces new model, Google updates Gemini...
```
Expected: [LOW] No Action Needed

### 7. Order Confirmation
```
Subject: Your order has been confirmed
Body: Thanks for your purchase! Order #12345 will arrive in 3-5 business days.
```
Expected: [LOW] No Action Needed

## No Urgency Tests

### 8. Marketing Email
```
Subject: 🎉 Flash Sale - 70% off everything!
Body: Shop now and save big on our entire collection. Sale ends Sunday!
```
Expected: [NONE] No Action Needed

### 9. Auto-Reply
```
Subject: Out of Office Auto-Reply
Body: I'm currently out of the office and will return Monday. For urgent matters, contact...
```
Expected: [NONE] No Action Needed

## Edge Cases to Test

### 10. Fake Urgency (Marketing)
```
Subject: URGENT: Your discount expires in 1 hour!
Body: Don't miss out on 20% off! Use code SAVE20 before it's too late!
```
Expected: [NONE] or [LOW] No Action Needed (AI should detect this is marketing)

### 11. Important but Not Urgent
```
Subject: Year-end performance review scheduled
Body: Your annual review is scheduled for December 15th at 2pm. No preparation needed.
```
Expected: [LOW] No Action Needed (informational, no immediate action)

### 12. Multiple Actions
```
Subject: 3 documents need your signature
Body: Please sign the following by EOD Friday: 1) NDA 2) Contract 3) Equipment form
```
Expected: [MEDIUM] Action Required - Sign 3 documents by end of Friday

## How to Test

1. Send these emails to your Gmail account
2. Watch Vercel logs: `vercel logs --follow`
3. See AI analysis in real-time
4. Check notification format

The AI should correctly identify:
- Urgency level based on context
- Whether action is required
- What specific action to take
- Who sent the email

This proves the AI is working intelligently, not just matching keywords!