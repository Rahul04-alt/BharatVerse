import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { vectorStore } from "./services/vectorStore.js";
import { ragService } from "./services/ragService.js";
import { mcpManager } from "./services/mcpClient.js";
import { langgraphAgent } from "./agents/langgraphAgent.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Cultural Vector Store on startup
vectorStore.initialize().then(() => {
  console.log("🇮🇳 [BharatVerse AI] Cultural Knowledge Vector Store initialized!");
}).catch((err) => {
  console.error("❌ [BharatVerse AI] Vector Store initialization error:", err.message);
});

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "BharatVerse Agentic AI & MCP Server",
    vectorStoreLoaded: vectorStore.isInitialized,
    indexedDocuments: vectorStore.documents.length,
    registeredMcpTools: mcpManager.listTools().map((t) => t.name),
    llmProvider: "Google Gemini (gemini-2.5-flash / text-embedding-004)",
  });
});

/**
 * List registered MCP Tools
 */
app.get("/api/mcp/tools", (req, res) => {
  res.json({
    tools: mcpManager.listTools(),
  });
});

/**
 * Direct Vector Search (RAG)
 */
app.post("/api/rag/search", async (req, res) => {
  try {
    const { query, topK, filter } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    const results = await vectorStore.search(query, topK || 4, filter || {});
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Standard REST Chat Endpoint (Non-streaming)
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await langgraphAgent.runGraph(message);
    res.json({
      text: result.finalResponse,
      sources: result.sources,
      quickActions: result.quickActions,
      cards: result.cards,
      steps: result.steps,
    });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Server-Sent Events (SSE) Streaming Chat Endpoint
 * Emits live agent status updates & tool-calling steps
 */
app.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent("status", { status: "🚀 Initializing BharatVerse Agent..." });

    const result = await langgraphAgent.runGraph(message, (statusText) => {
      sendEvent("status", { status: statusText });
    });

    sendEvent("complete", {
      text: result.finalResponse,
      sources: result.sources,
      quickActions: result.quickActions,
      cards: result.cards,
      steps: result.steps,
    });
  } catch (err) {
    console.error("Stream error:", err);
    sendEvent("error", { error: err.message });
  } finally {
    res.end();
  }
});

/**
 * RAG + MCP Enhanced Itinerary Planning Endpoint
 */
app.post("/api/itinerary", async (req, res) => {
  try {
    const params = req.body;
    const { state, startDate, endDate, startTime, endTime } = params;

    const queryState = !state || state === "any" ? "Rajasthan" : state;

    // 1. RAG retrieval of verified sites in this state
    const regionalDocs = await vectorStore.search(queryState, 4);
    const verifiedSites = regionalDocs.map((d) => `${d.title} (${d.category}): ${d.content}`).join("\n\n");

    // 2. Query Weather MCP for climate suitability
    const weatherResult = await mcpManager.callTool("get_weather", { location: queryState });
    const weatherData = weatherResult.data || {};

    // 3. Generate structured itinerary
    const start = new Date(startDate || Date.now());
    const end = new Date(endDate || Date.now() + 86400000 * 3);
    const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const prompt = `
You are the Salahkar Smart Itinerary Planner of BharatVerse.
Generate a realistic ${dayCount}-day cultural itinerary for ${queryState}.
User Times: ${startTime} to ${endTime} daily.

VERIFIED HERITAGE & HIDDEN GEMS FROM ARCHIVES:
${verifiedSites}

METEOROLOGICAL DATA:
Temperature: ${weatherData.temperature || 25}°C, Condition: ${weatherData.condition || "Pleasant"}

Format STRICT JSON matching this schema:
{
  "selectedState": "${queryState}",
  "recommendationReason": "string (why suitable for ${dayCount} days)",
  "recommendedCities": ["city1", "city2"],
  "tripSummary": "2-3 sentences overview",
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate || "2026-11-15"}",
      "theme": "Heritage Exploration",
      "activities": [
        {
          "startTime": "${startTime || "09:00"}",
          "endTime": "12:00",
          "title": "Visit ${regionalDocs[0]?.title || "Iconic Heritage Site"}",
          "shortDescription": "Explore ancient architecture and cultural history.",
          "location": "${queryState}",
          "area": "${queryState}",
          "recommendedTransport": "Local Cab or Metro",
          "estimatedCostINR": 250,
          "duration": "3 hours",
          "safetyTips": "Carry drinking water and comfortable shoes."
        }
      ],
      "dayTotal": 750
    }
  ],
  "costBreakdown": {
    "totalTransportCostINR": 800,
    "totalFoodCostINR": 1200,
    "totalActivityTicketsCostINR": 600,
    "totalEstimatedCostINR": 2600,
    "costPerDayAverage": 1300
  },
  "generalSafetyRecommendations": ["Stay hydrated", "Follow ASI monument guidelines"],
  "bestTimeToVisit": "October to March",
  "travelTips": ["Book tickets online for ASI monuments"],
  "packingRecommendations": ["Cotton clothing", "Sun protection"]
}
`;

    if (genAI) {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(prompt);
      const itinerary = JSON.parse(result.response.text());
      return res.json(itinerary);
    }

    res.status(500).json({ error: "Gemini AI not initialized on server" });
  } catch (err) {
    console.error("Itinerary endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 [BharatVerse AI] Agentic & MCP Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready for RAG queries, LangGraph workflows, and MCP tools.`);
});

