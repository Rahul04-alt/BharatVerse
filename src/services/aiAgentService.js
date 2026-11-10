import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * BharatVerse AI Agent Service
 * Connects to LangGraph + RAG + MCP Backend with seamless client-side Gemini fallback
 */
export async function sendAgentMessage({ message, onStatus = () => {} }) {
  // 1. Try Backend Streaming SSE Endpoint
  try {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completedData = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n").filter(Boolean);

        for (const eventStr of events) {
          const lines = eventStr.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.replace("event: ", "").trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.replace("data: ", "").trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === "status" && parsed.status) {
                onStatus(parsed.status);
              } else if (eventType === "complete") {
                completedData = parsed;
              }
            } catch (err) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      if (completedData) {
        return completedData;
      }
    }
  } catch (err) {
    console.warn("[AgentService] Backend not reachable, using client-side Gemini fallback...", err.message);
  }

  // 2. Client-side Fallback (Gemini API)
  onStatus("Connecting to Gemini AI Guide...");
  if (!GEMINI_API_KEY) {
    throw new Error("No Gemini API key available");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const prompt = `You are BharatVerse AI Heritage Guide ("Acharya"), an expert on Indian culture, heritage, monuments, festivals, arts, history, and traditions.

User question: ${message}

Provide a comprehensive, accurate, and culturally reverent response. Highlight historical context, architectural styles, and community traditions.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  return {
    text: responseText,
    sources: [
      { title: "BharatVerse Cultural Knowledgebase", state: "India", category: "heritage" },
    ],
    quickActions: [
      { label: "Take 360° Virtual Tour", type: "360tour" },
      { label: "Locate on Heritage Map", type: "map" },
      { label: "Cultural Quiz Arena", type: "quiz" },
    ],
    cards: [],
  };
}

