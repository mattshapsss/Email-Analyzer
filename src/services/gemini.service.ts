import { GoogleGenerativeAI } from '@google/generative-ai';
import { Email, AnalysisResult, ActionType, UrgencyLevel, EmailCategory } from '../types';
import { parseISO, isValid } from 'date-fns';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeEmail(email: Email): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(email);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAnalysisResponse(text, email.id);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return this.getDefaultAnalysis(email.id);
    }
  }

  async analyzeBatch(emails: Email[]): Promise<AnalysisResult[]> {
    const results = await Promise.all(
      emails.map(email => this.analyzeEmail(email))
    );
    return results;
  }

  private buildAnalysisPrompt(email: Email): string {
    return `Analyze this email and provide a structured response in JSON format.

Email Details:
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date.toISOString()}
Body: ${email.body.substring(0, 1000)}

Respond with ONLY valid JSON in this exact format:
{
  "needsAction": boolean,
  "actionType": "reply" | "call" | "schedule" | "review" | "delegate" | "none",
  "urgencyLevel": "high" | "medium" | "low" | "none",
  "deadline": "YYYY-MM-DD" or null,
  "category": "work" | "personal" | "promotional" | "social" | "updates" | "forums" | "spam" | "other",
  "summary": "Brief 1-2 sentence summary",
  "confidence": 0.0 to 1.0
}

Considerations:
- High urgency: deadlines < 48 hours, financial matters, health issues
- Medium urgency: deadlines < 1 week, important but not critical
- Low urgency: informational, no specific deadline
- Action types based on email content and sender relationship
- Confidence based on clarity of required action`;
  }

  private parseAnalysisResponse(text: string, emailId: string): AnalysisResult {
    try {
      const jsonMatch = text.match(/{[^}]+}/s);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      let deadline: Date | undefined;
      if (parsed.deadline && typeof parsed.deadline === 'string') {
        const parsedDate = parseISO(parsed.deadline);
        if (isValid(parsedDate)) {
          deadline = parsedDate;
        }
      }

      return {
        emailId,
        needsAction: Boolean(parsed.needsAction),
        actionType: this.validateActionType(parsed.actionType),
        urgencyLevel: this.validateUrgencyLevel(parsed.urgencyLevel),
        deadline,
        category: this.validateCategory(parsed.category),
        summary: String(parsed.summary || 'No summary available'),
        confidence: this.validateConfidence(parsed.confidence),
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return this.getDefaultAnalysis(emailId);
    }
  }

  private validateActionType(type: string): ActionType {
    const validTypes = Object.values(ActionType);
    return validTypes.includes(type as ActionType) ? type as ActionType : ActionType.NONE;
  }

  private validateUrgencyLevel(level: string): UrgencyLevel {
    const validLevels = Object.values(UrgencyLevel);
    return validLevels.includes(level as UrgencyLevel) ? level as UrgencyLevel : UrgencyLevel.NONE;
  }

  private validateCategory(category: string): EmailCategory {
    const validCategories = Object.values(EmailCategory);
    return validCategories.includes(category as EmailCategory) ? category as EmailCategory : EmailCategory.OTHER;
  }

  private validateConfidence(confidence: any): number {
    const num = parseFloat(confidence);
    if (isNaN(num)) return 0.5;
    return Math.max(0, Math.min(1, num));
  }

  private getDefaultAnalysis(emailId: string): AnalysisResult {
    return {
      emailId,
      needsAction: false,
      actionType: ActionType.NONE,
      urgencyLevel: UrgencyLevel.NONE,
      category: EmailCategory.OTHER,
      summary: 'Analysis unavailable',
      confidence: 0,
      analyzedAt: new Date()
    };
  }
}

export const geminiService = new GeminiService();