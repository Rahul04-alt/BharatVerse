import { GoogleGenerativeAI } from "@google/generative-ai";
import { ragService } from "../services/ragService.js";
import { mcpManager } from "../services/mcpClient.js";
import { vectorStore } from "../services/vectorStore.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Multi-Agent Cultural Orchestrator
 * Implements a state-graph flow: Supervisor -> [Guide | Itinerary | Quiz] -> Synthesizer
 */
export class CulturalLangGraphAgent {
  constructor() {
    this.modelName = "gemini-2.5-flash";
  }

  /**
   * Node 1: Supervisor Router
   * Determines user intent
   */
  async supervisorNode(state, onStatus) {
    onStatus("🧠 Supervisor: Analyzing cultural intent & routing query...");
    const text = state.userQuery.toLowerCase();

    if (text.match(/itinerary|trip|plan|travel|days in|budget|visit schedule|route/i)) {
      state.intent = "ITINERARY";
    } else if (text.match(/quiz|test me|trivia|question|challenge|game/i)) {
      state.intent = "QUIZ";
    } else {
      state.intent = "HERITAGE_GUIDE";
    }

    state.steps.push(`Intent classified as: ${state.intent}`);
    return state;
  }

  /**
   * Node 2: Heritage Guide Agent (with RAG + 360 Tour MCP)
   */
  async heritageGuideNode(state, onStatus) {
    onStatus("🏛️ Guide Agent: Querying vector database for verified archives...");
    
    // Execute RAG
    const ragResult = await ragService.answerQuery(state.userQuery);
    state.finalResponse = ragResult.text;
    state.sources = ragResult.sources || [];
    state.quickActions = ragResult.quickActions || [];

    // Check if 360 tour exists using MCP
    onStatus("🌐 Checking 360° Virtual Tour availability via MCP...");
    const tourResult = await mcpManager.callTool("get_monument_360_tour", {
      monumentName: state.userQuery,
    });

    if (tourResult.success && tourResult.data && tourResult.data.has360Tour) {
      state.cards.push({
        type: "360tour",
        data: tourResult.data,
      });
    }

    // Check if location weather is relevant
    if (state.userQuery.match(/weather|rain|temperature|climate|season/i) || state.sources.length > 0) {
      const location = state.sources[0]?.state || "India";
      onStatus(`⛅ Fetching live weather for ${location} via Weather MCP...`);
      const weatherResult = await mcpManager.callTool("get_weather", { location });
      if (weatherResult.success && weatherResult.data) {
        state.cards.push({
          type: "weather",
          data: weatherResult.data,
        });
      }
    }

    return state;
  }

  /**
   * Node 3: Itinerary Planner Agent (with Weather + Maps MCP)
   */
  async itineraryPlannerNode(state, onStatus) {
    onStatus("🗺️ Itinerary Agent: Retrieving regional hidden gems & transit options...");

    // 1. Vector Search for regional hidden gems
    const gems = await vectorStore.search(state.userQuery, 3);
    const contextGems = gems.map(g => `${g.title} (${g.state}): ${g.content}`).join("\n");

    // 2. Query Weather MCP
    const targetState = gems[0]?.state || "Rajasthan";
    onStatus(`⛅ Checking meteorological suitability for ${targetState}...`);
    const weather = await mcpManager.callTool("get_weather", { location: targetState });

    // 3. Query Transit Route MCP
    onStatus("🚗 Calculating optimal transit route via Maps MCP...");
    const transit = await mcpManager.callTool("get_transit_route", {
      origin: "Hub City",
      destination: gems[0]?.title || targetState,
      mode: "drive",
    });

    if (weather.success && weather.data) {
      state.cards.push({ type: "weather", data: weather.data });
    }
    if (transit.success && transit.data) {
      state.cards.push({ type: "route", data: transit.data });
    }

    // 4. Generate structured day plan with LLM
    onStatus("✨ Itinerary Agent: Synthesizing day-by-day cultural schedule...");
    const prompt = `
You are the Salahkar Smart Itinerary Planner of BharatVerse.
USER REQUEST: ${state.userQuery}

REGIONAL CULTURAL ARCHIVES:
${contextGems}

LIVE WEATHER STATUS:
${JSON.stringify(weather.data || {})}

TRANSIT METRICS:
${JSON.stringify(transit.data || {})}

Please produce a concise, highly realistic day-wise cultural plan. Include:
1. Recommended Days & Cities
2. Day-by-day morning, afternoon, and evening heritage highlights
3. Local authentic cuisine recommendations
4. Practical safety and respectful cultural tips
`.trim();

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: this.modelName });
        const res = await model.generateContent(prompt);
        state.finalResponse = res.response.text();
      } catch {
        state.finalResponse = `Here is your recommended cultural itinerary for ${targetState}:\n\n` +
          `• Day 1: Arrive & explore iconic heritage monuments\n` +
          `• Day 2: Discover community hidden gems and local artisan workshops\n` +
          `• Day 3: Experience traditional arts, culinary trails & sunset viewpoints.`;
      }
    } else {
      state.finalResponse = `Here is your cultural itinerary plan:\n\nBased on regional archives for ${targetState}, recommend 2-3 days covering top monuments and community hidden gems.`;
    }

    state.sources = gems.map(g => ({ title: g.title, state: g.state, category: g.category }));
    state.quickActions = [
      { label: "Open Itinerary Planner", type: "itinerary" },
      { label: "View on Map", type: "map" },
    ];

    return state;
  }

  /**
   * Node 4: Quiz Master Agent (Gamified Cultural Challenge)
   */
  async quizMasterNode(state, onStatus) {
    onStatus("🏆 Quiz Master: Synthesizing cultural challenge question from archives...");

    // Retrieve topic docs
    const topicDocs = await vectorStore.search(state.userQuery, 2);
    const topic = topicDocs[0]?.title || "Indian Cultural Heritage";

    const prompt = `
Generate ONE engaging, multiple-choice quiz question about "${topic}" or Indian culture.
Output STRICT JSON ONLY:
{
  "question": "string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": number (0 to 3),
  "funFact": "1-2 sentence fascinating historical fact",
  "difficulty": "Easy" | "Medium" | "Expert"
}
`;

    let quizData = null;
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const res = await model.generateContent(prompt);
        quizData = JSON.parse(res.response.text());
      } catch (err) {
        console.warn("[QuizAgent] JSON parse or generation fallback:", err.message);
      }
    }

    if (!quizData) {
      quizData = {
        question: `Which dynasty is famously associated with the construction of monuments in ${topic}?`,
        options: ["Chola Dynasty", "Mughal Empire", "Gupta Empire", "Vijayanagara Empire"],
        correctIndex: 1,
        funFact: "India's architectural heritage features contributions from over 30 major royal dynasties over 3,000 years!",
        difficulty: "Medium",
      };
    }

    state.finalResponse = `🎯 **Here is your Cultural Heritage Challenge!** Test your knowledge below and earn +20 XP for your BharatVerse leaderboard rank:`;
    state.cards.push({
      type: "quiz",
      data: quizData,
    });
    state.quickActions = [
      { label: "Play Full Quiz Arena", type: "quiz" },
      { label: "Explore Monument Details", type: "heritage" },
    ];

    return state;
  }

  /**
   * Execution Pipeline running the graph
   */
  async runGraph(userQuery, onStatus = () => {}) {
    const state = {
      userQuery,
      intent: null,
      steps: [],
      sources: [],
      quickActions: [],
      cards: [],
      finalResponse: "",
    };

    // 1. Supervisor
    await this.supervisorNode(state, onStatus);

    // 2. Conditional Routing
    if (state.intent === "ITINERARY") {
      await this.itineraryPlannerNode(state, onStatus);
    } else if (state.intent === "QUIZ") {
      await this.quizMasterNode(state, onStatus);
    } else {
      await this.heritageGuideNode(state, onStatus);
    }

    onStatus("✨ Agent: Ready!");
    return state;
  }
}

export const langgraphAgent = new CulturalLangGraphAgent();

