import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Vercel serverless function to handle Gmail Pub/Sub push notifications
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the Pub/Sub message
    const { message } = req.body;
    
    if (!message || !message.data) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Decode the base64 message
    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(decodedData);
    
    console.log('Gmail notification received:', {
      emailAddress: notification.emailAddress,
      historyId: notification.historyId
    });

    // Get the latest email that triggered this notification
    const accessToken = req.headers['x-access-token'] as string;
    
    if (accessToken) {
      // Fetch the new email
      const emailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:unread`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        
        if (emailData.messages && emailData.messages.length > 0) {
          // Get email details
          const messageId = emailData.messages[0].id;
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );

          if (detailResponse.ok) {
            const emailDetail = await detailResponse.json();
            
            // Extract email info
            const headers = emailDetail.payload.headers;
            const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
            
            // Here you would analyze with Gemini and send push notification
            console.log('New email:', { subject, from });
            
            // TODO: Call Gemini API to analyze urgency
            // TODO: Send push notification if urgent
          }
        }
      }
    }

    // Acknowledge the message
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}