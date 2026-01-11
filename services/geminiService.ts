import { GoogleGenAI } from "@google/genai";
import { StudentWithBalance, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIInsight = async (
  query: string,
  students: StudentWithBalance[],
  recentTransactions: Transaction[]
): Promise<string> => {
  try {
    const dataContext = JSON.stringify({
      students: students.map(s => ({
        name: s.name,
        class: s.className,
        balance: s.balance,
        contact: s.email || s.phone || 'No contact info'
      })),
      recent_transactions_summary: `Total transactions: ${recentTransactions.length}`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an intelligent assistant for a tutor's fee collection app.
        Here is the current financial context (JSON):
        ${dataContext}

        User Query: ${query}

        Instructions:
        1. If asking for a reminder, draft a polite, professional message (WhatsApp/Email style) for the specific student or a general template.
        2. If asking for analysis, summarize the debt status.
        3. Keep responses concise and helpful.
      `,
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while communicating with the AI assistant.";
  }
};
