import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Complete webhook with AI analysis and push notifications
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message || !message.data) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Decode the Pub/Sub message
    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(decodedData);
    
    console.log('📧 New Gmail notification:', {
      email: notification.emailAddress,
      historyId: notification.historyId
    });

    // For now, we'll need the access token passed somehow
    // In production, you'd store this securely
    const accessToken = process.env.GMAIL_ACCESS_TOKEN || '';

    // Fetch the latest unread email
    const emailsResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:unread',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!emailsResponse.ok) {
      console.error('Failed to fetch emails');
      return res.status(200).json({ processed: false });
    }

    const emailsList = await emailsResponse.json();
    
    if (!emailsList.messages || emailsList.messages.length === 0) {
      return res.status(200).json({ processed: false, reason: 'No unread emails' });
    }

    // Get full email details
    const messageId = emailsList.messages[0].id;
    const emailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!emailResponse.ok) {
      console.error('Failed to fetch email details');
      return res.status(200).json({ processed: false });
    }

    const email = await emailResponse.json();
    
    // Extract email info
    const headers = email.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
    const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();
    
    // Get email body
    let body = '';
    const extractBody = (part: any): void => {
      if (part.body?.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };
    extractBody(email.payload);

    // Analyze with Gemini AI
    console.log('🤖 Analyzing email with AI...');
    
    const prompt = `You are an expert email analyzer. Analyze this email and determine its urgency and whether it requires action.

URGENCY LEVELS:
- HIGH: Requires immediate attention (within hours). Examples: server down, payment overdue, meeting starting soon, urgent deadlines, family emergencies
- MEDIUM: Requires attention within 1-3 days. Examples: document reviews, meeting invites, feedback requests, non-urgent bills
- LOW: Can wait a week or more. Examples: newsletters, social updates, receipts, confirmations
- NONE: No time sensitivity. Examples: promotions, spam, auto-replies, marketing

ACTION REQUIRED:
- True if the recipient needs to DO something (reply, click, pay, review, approve, etc.)
- False if it's just informational (newsletters, receipts, confirmations, FYIs)

Email Details:
From: ${from}
Subject: ${subject}
Date: ${date}
Body: ${body.substring(0, 1500)}...

Analyze the email content, subject, sender, and context. Consider:
1. Time-sensitive language ("urgent", "ASAP", "deadline", "expires")
2. Action verbs ("please reply", "review", "approve", "sign")
3. Sender importance (boss, family, financial institutions vs newsletters)
4. Content type (bills, meetings, legal documents vs marketing)

Respond in JSON format:
{
  "requiresAction": boolean,
  "urgencyLevel": "high"|"medium"|"low"|"none",
  "actionSummary": "Brief 1-line description of required action or null if no action needed",
  "deadline": "ISO date string if mentioned or null"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());
    
    console.log('📊 AI Analysis:', analysis);

    // Send push notification for EVERY email
    console.log('📱 Preparing push notification...');
    
    // Format urgency for notification
    const urgencyDisplay = analysis.urgencyLevel.toUpperCase();
    const actionRequired = analysis.requiresAction ? 'Action Required' : 'No Action Needed';
    
    // Extract sender name
    const senderMatch = from.match(/^([^<]+)/);
    const senderName = senderMatch ? senderMatch[1].trim() : 'Unknown Sender';
    
    // Create notification body with AI context
    let notificationBody = `${actionRequired}\n`;
    if (analysis.actionSummary && analysis.requiresAction) {
      notificationBody += `${analysis.actionSummary}\n`;
    }
    notificationBody += `From: ${senderName}`;
    
    const pushPayload = {
      title: `[${urgencyDisplay}] ${subject.substring(0, 40)}${subject.length > 40 ? '...' : ''}`,
      body: notificationBody,
      data: {
        emailId: messageId,
        urgency: analysis.urgencyLevel,
        requiresAction: analysis.requiresAction,
        deadline: analysis.deadline,
        from: from,
        subject: subject
      }
    };
    
    console.log('📱 Push notification payload:', pushPayload);
    
    // In production, you'd send to iOS via:
    // - Firebase Cloud Messaging
    // - Apple Push Notification Service  
    // - OneSignal (free tier available)

    // Mark as processed
    res.status(200).json({ 
      success: true, 
      processed: true,
      analysis,
      emailSubject: subject
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}