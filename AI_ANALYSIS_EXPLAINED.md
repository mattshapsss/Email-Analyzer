# 🤖 AI Email Analysis - How It Works

## Yes, It's All AI-Powered!

The urgency levels and action detection are **100% determined by Gemini AI** with carefully crafted prompting. Here's exactly how it works:

## The AI Prompt

The webhook sends each email to Gemini with this detailed prompt:

```
You are an expert email analyzer. Analyze this email and determine its urgency and whether it requires action.

URGENCY LEVELS:
- HIGH: Requires immediate attention (within hours)
- MEDIUM: Requires attention within 1-3 days
- LOW: Can wait a week or more
- NONE: No time sensitivity

ACTION REQUIRED:
- True if the recipient needs to DO something
- False if it's just informational
```

## What the AI Analyzes

### 1. **Time-Sensitive Language**
- "urgent", "ASAP", "immediately"
- "deadline", "expires", "due date"
- "meeting starting", "call in 5 minutes"

### 2. **Action Verbs**
- "please reply", "respond by"
- "review and approve"
- "sign and return"
- "complete the survey"
- "pay invoice"

### 3. **Sender Importance**
- Boss/Manager → Higher urgency
- Family → Context-dependent
- Financial institutions → Usually medium-high
- Newsletters → Low/none

### 4. **Content Type**
- Bills → HIGH if overdue, MEDIUM otherwise
- Meeting invites → MEDIUM (HIGH if starting soon)
- Legal documents → Usually HIGH
- Marketing → NONE
- Receipts → LOW/NONE

## Real Examples

### Email 1: "Server is down!"
```
From: ops-team@company.com
Subject: URGENT: Production server is down
Body: The main server is experiencing critical errors...

AI Analysis:
{
  "urgencyLevel": "high",
  "requiresAction": true,
  "actionSummary": "Investigate and restart production server immediately"
}

Notification:
[HIGH] URGENT: Production server is down
Action Required
Investigate and restart production server immediately
From: ops-team
```

### Email 2: "Team lunch next week"
```
From: sarah@company.com
Subject: Team lunch Tuesday - RSVP
Body: Hi team, let's grab lunch next Tuesday at noon...

AI Analysis:
{
  "urgencyLevel": "medium",
  "requiresAction": true,
  "actionSummary": "RSVP for team lunch on Tuesday"
}

Notification:
[MEDIUM] Team lunch Tuesday - RSVP
Action Required
RSVP for team lunch on Tuesday
From: sarah
```

### Email 3: "Your Amazon order shipped"
```
From: shipment-tracking@amazon.com
Subject: Your order has been shipped
Body: Your package will arrive Thursday...

AI Analysis:
{
  "urgencyLevel": "low",
  "requiresAction": false,
  "actionSummary": null
}

Notification:
[LOW] Your order has been shipped
No Action Needed
From: Amazon
```

### Email 4: "50% off sale!"
```
From: promotions@store.com
Subject: Flash Sale - 50% off everything!
Body: Shop now and save big...

AI Analysis:
{
  "urgencyLevel": "none",
  "requiresAction": false,
  "actionSummary": null
}

Notification:
[NONE] Flash Sale - 50% off everything!
No Action Needed
From: Store Promotions
```

## Why This Works Well

1. **Context Understanding**: AI reads the full email body, not just subject
2. **Smart Detection**: Recognizes phrases like "please reply by Friday"
3. **Sender Analysis**: Knows your boss's email is more urgent than spam
4. **Time Awareness**: Detects "meeting in 10 minutes" vs "meeting next month"
5. **Action Recognition**: Identifies when YOU need to do something

## The Magic Formula

```
Email → Gemini AI Analysis → Structured Output → Beautiful Notification
```

Every email gets:
- ✅ Full content analysis (up to 1500 characters)
- ✅ Urgency determination (HIGH/MEDIUM/LOW/NONE)
- ✅ Action detection (Required/Not Required)
- ✅ One-line action summary (if needed)
- ✅ Deadline extraction (if mentioned)

## Accuracy Tips

The AI is very good but gets even better when emails contain:
- Clear subject lines
- Action words ("please", "review", "approve")
- Deadlines ("by Friday", "before 5pm")
- Context about importance

## What Makes It Special

Unlike simple keyword matching, the AI:
- Understands context ("urgent" in a sale email vs work email)
- Recognizes implied urgency (meeting starting soon)
- Extracts specific actions needed
- Adapts to different email styles

This is why you get intelligent notifications like:
```
[HIGH] Payment overdue - Final notice
Action Required
Pay invoice #1234 to avoid service suspension
From: Billing Dept
```

Instead of just:
```
New email from Billing Dept
```

The AI makes your notifications actually useful! 🎯