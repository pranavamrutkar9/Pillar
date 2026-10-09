import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export interface AIProvider {
  generateStandup(payload: any): Promise<{ yesterday: string[], today: string[], attention: string[] }>;
}

const standupSchema = z.object({
  yesterday: z.array(z.string()),
  today: z.array(z.string()),
  attention: z.array(z.string()),
});

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  }

  async generateStandup(payload: any) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
You are an AI assistant generating a daily standup draft.
Here are the factual activity summaries for the user.
Extract the achievements into a concise bulleted list for 'yesterday'.
Select and rewrite the most relevant items from today's candidates for 'today'. Do not list every assigned issue if there are many.
Identify items needing attention (stale issues, aging PRs, review workloads) without definitively calling them "blockers" unless explicitly factual.

Format the output EXACTLY as this JSON object: 
{ "yesterday": string[], "today": string[], "attention": string[] }

Return ONLY the raw JSON object. No markdown. No code blocks. No explanation. Start your response with { and end with }.

Strict constraints:
- Do not hallucinate.
- Every statement must be directly supported by the supplied facts.
- Do not infer completion, intent, causality, blockers, or future plans that are not present in the input.
- Attention signals are signals, NOT confirmed blockers.
- Do not invent information missing from the payload.
- Return only the required JSON structure.

Facts:
${JSON.stringify(payload, null, 2)}
`;

    try {
      let parsed;
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        if (text.startsWith("```")) {
          text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        }
        parsed = standupSchema.parse(JSON.parse(text));
      } catch (parseError) {
        console.warn("First parse failed, retrying with stricter prompt...", parseError);
        const retryPrompt = prompt + "\n\nCRITICAL: Your previous response was invalid. Return ONLY valid JSON, no markdown, no code blocks, no explanation.";
        const retryResult = await model.generateContent(retryPrompt);
        const retryResponse = await retryResult.response;
        let retryText = retryResponse.text().trim();
        if (retryText.startsWith("```")) {
          retryText = retryText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        }
        parsed = standupSchema.parse(JSON.parse(retryText));
      }
      return parsed;
    } catch (e) {
      console.warn("Gemini API failed, falling back to mock generation:", e);
      
      // Fallback logic to still demonstrate the feature during API outages
      const mockYesterday = payload.yesterday?.events?.length > 0 
        ? ["Made progress on assigned tasks and moved issues on the board."]
        : ["No events logged yesterday."];
        
      const mockToday = payload.today?.assignedIssues?.length > 0
        ? payload.today.assignedIssues.map((i: any) => `Will work on: ${i.title}`)
        : ["No open issues assigned for today."];
        
      const mockAttention = payload.attention?.staleIssues?.length > 0
        ? ["Need to follow up on stale issues."]
        : ["No immediate blockers or stale issues."];
        
      return {
        yesterday: mockYesterday,
        today: mockToday,
        attention: mockAttention
      };
    }
  }
}

export const aiService = new GeminiProvider();
