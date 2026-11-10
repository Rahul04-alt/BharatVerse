import { GoogleGenerativeAI } from "@google/generative-ai";
import { vectorStore } from "./vectorStore.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export class CulturalRAGService {
  constructor() {
    this.modelName = "gemini-flash-latest";
  }

  /**
   * System Prompt with advanced prompt engineering guardrails
   */
  static getSystemPrompt(retrievedContext) {
    return `
You are "Acharya", the Chief Cultural Scholar and AI Guide of BharatVerse (India's premier digital heritage and cultural preservation platform).

YOUR MISSION:
Deliver deep, authentic, historically rigorous, and inspiring guidance on India's 5,000-year-old heritage, arts, festivals, rituals, and undiscovered hidden gems.

AUTHENTIC VERIFIED ARCHIVES (From Archaeological Survey of India & BharatVerse Archives):
${retrievedContext}

STRICT GUIDELINES:
1. FACTUAL GROUNDING: Rely on the verified archives provided above. Mention historical dynasties (e.g. Cholas, Guptas, Mughals, Vijayanagara, Marathas), architectural styles (Dravidian, Nagara, Vesara, Indo-Islamic), and cultural philosophies.
2. NO HALLUCINATION: If the context does not cover obscure folk legends, clearly distinguish between established historical facts and local oral folklore.
3. ACCENTUATE HIDDEN GEMS: If the user asks about an iconic site, seamlessly introduce a related or nearby "Hidden Gem" from the archives to boost local community heritage.
4. TONE: Warm, reverent, scholarly yet accessible to travelers and students. Start with a respectful Indian greeting when appropriate ("Namaste! 🙏").
5. FORMAT: Use clean Markdown formatting with clear bullet points, bold highlights, and readable sections.
`.trim();
  }

  /**
   * Answer user query with RAG pipeline
   */
  async answerQuery(userQuery, options = {}) {
    // 1. Vector Search
    const topMatches = await vectorStore.search(userQuery, 3, options.filter || {});
    
    const contextText = topMatches.length > 0
      ? topMatches.map((doc, idx) => `[Source ${idx + 1}: ${doc.title} (${doc.state} - ${doc.category})]\n${doc.content}`).join("\n\n")
      : "No direct matching archive found. Use general Indian heritage scholarly knowledge with careful qualification.";

    const systemPrompt = CulturalRAGService.getSystemPrompt(contextText);

    // 2. Prepare action pills based on retrieved items
    const quickActions = [];
    const topDoc = topMatches[0];

    if (topDoc) {
      if (topDoc.category === "monument" || topDoc.category === "hidden_gem") {
        quickActions.push({
          label: `Explore ${topDoc.title} in 360°`,
          type: "360tour",
          target: topDoc.title,
        });
        quickActions.push({
          label: `Locate on Heritage Map`,
          type: "map",
          target: topDoc.state,
        });
      }
      quickActions.push({
        label: `Test Knowledge on ${topDoc.title}`,
        type: "quiz",
        target: topDoc.title,
      });
    }

    // 3. Generate response with LLM
    if (!genAI) {
      return {
        text: `**Namaste!** I am operating in offline mode. Based on our archives:\n\n${topMatches.map(m => `### ${m.title} (${m.state})\n${m.content}`).join("\n\n")}`,
        sources: topMatches.map(m => ({ title: m.title, state: m.state, category: m.category })),
        quickActions,
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.4, // Low temperature for high factual accuracy
          topP: 0.9,
          maxOutputTokens: 1200,
        },
      });

      const prompt = `${systemPrompt}\n\nUSER QUESTION: ${userQuery}\n\nSCHOLARLY RESPONSE:`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return {
        text,
        sources: topMatches.map((m) => ({
          title: m.title,
          state: m.state,
          category: m.category,
          rating: m.rating,
        })),
        quickActions,
      };
    } catch (err) {
      console.error("[RAGService] Gemini primary invocation failed, trying fallback:", err.message);
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await fallbackModel.generateContent(`${systemPrompt}\n\nUSER QUESTION: ${userQuery}`);
        return {
          text: result.response.text(),
          sources: topMatches.map((m) => ({ title: m.title, state: m.state, category: m.category })),
          quickActions,
        };
      } catch (fallbackErr) {
        return {
          text: `Namaste! Here is what our cultural archives say regarding your query:\n\n${topMatches.map(m => `**${m.title}** (${m.state}):\n${m.content}`).join("\n\n")}`,
          sources: topMatches.map((m) => ({ title: m.title, state: m.state })),
          quickActions,
        };
      }
    }
  }
}

export const ragService = new CulturalRAGService();

