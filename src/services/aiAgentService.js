/**
 * BharatVerse AI Agent Service
 * Priority chain:
 *   1. LangGraph + RAG + MCP backend (Express on port 5000)
 *   2. Client-side Gemini via direct REST API (no SDK dependency)
 *   3. Rich offline fallback with curated cultural content
 *
 * Returns `_source` field: "rag_backend" | "gemini" | "offline"
 * so ChatPage can show the appropriate status toast.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_REST_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ---------------------------------------------------------------------------
// Offline Fallback Content – used only when both backend and Gemini are down
// ---------------------------------------------------------------------------
const OFFLINE_RESPONSES = {
  taj: {
    text: "🕌 **Taj Mahal – The Crown of Palaces**\n\nBuilt by Mughal Emperor Shah Jahan between 1631–1648 AD in memory of his beloved wife Mumtaz Mahal, the Taj Mahal stands as one of the finest examples of Mughal architecture. Made of pure white Makrana marble, it features intricate pietra dura inlay work with semi-precious stones. It was declared a UNESCO World Heritage Site in 1983.\n\n**Key Facts:**\n• Location: Agra, Uttar Pradesh\n• Height: 73 metres\n• Architect: Ustad Ahmad Lahauri (lead)\n• Best viewed: At sunrise or under a full moon",
    sources: [{ title: "UNESCO World Heritage – Taj Mahal", state: "Uttar Pradesh", category: "monument" }],
  },
  diwali: {
    text: "🪔 **Diwali – Festival of Lights**\n\nDiwali (Deepawali) is India's most celebrated festival, observed on the new moon night of Kartik (Oct–Nov). It symbolises the victory of light over darkness and knowledge over ignorance.\n\n**Traditions:**\n• Lighting diyas (clay lamps) and candles\n• Rangoli art at doorsteps\n• Worship of Goddess Lakshmi and Lord Ganesha\n• Exchange of sweets and gifts\n• Fireworks displays\n\nThe festival spans five days, each with its own significance across regions.",
    sources: [{ title: "BharatVerse Festival Database", state: "Pan-India", category: "festival" }],
  },
  holi: {
    text: "🎨 **Holi – Festival of Colors**\n\nHoli is a Hindu spring festival celebrated on the full moon of Phalguna (Feb–Mar). It marks the end of winter and the victory of good over evil (the legend of Holika).\n\n**Traditions:**\n• Playing with colored powder (gulal) and water\n• Bhang (traditional drink)\n• Bonfires on Holika Dahan night\n• Sweets like gujiya and thandai\n\n**Regional varieties:** Lathmar Holi (Barsana), Phoolon ki Holi (Vrindavan), Rang Panchami (Maharashtra).",
    sources: [{ title: "BharatVerse Festival Database", state: "Pan-India", category: "festival" }],
  },
  default: {
    text: "🏛️ **BharatVerse Heritage Guide (Offline Mode)**\n\nI'm currently in limited offline mode. Here are some fascinating topics I can tell you about once connectivity is restored:\n\n• **Monuments**: Taj Mahal, Red Fort, Hampi, Khajuraho, Konark Sun Temple\n• **Festivals**: Diwali, Holi, Durga Puja, Pongal, Onam, Navratri\n• **Arts**: Bharatanatyam, Kathak, Madhubani paintings, Warli art\n• **History**: Maurya Empire, Mughal era, Chola dynasty, Maratha Kingdom\n• **Cuisine**: Regional delicacies from all 28 states\n\nTry asking about any of these topics, or start the backend server for full AI capabilities!",
    sources: [{ title: "BharatVerse Cultural Archive", state: "India", category: "heritage" }],
  },
};

function getOfflineResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("taj") || lower.includes("mahal")) return OFFLINE_RESPONSES.taj;
  if (lower.includes("diwali") || lower.includes("deepawali")) return OFFLINE_RESPONSES.diwali;
  if (lower.includes("holi") || lower.includes("colors")) return OFFLINE_RESPONSES.holi;
  return OFFLINE_RESPONSES.default;
}

// ---------------------------------------------------------------------------
// 2. Direct Gemini REST fallback (no SDK – avoids SDK-level errors)
// ---------------------------------------------------------------------------
async function callGeminiREST(message, onStatus) {
  if (!GEMINI_API_KEY) {
    throw new Error("No Gemini API key configured");
  }

  onStatus("🤖 Connecting to Gemini AI...");

  const prompt = `You are "Acharya", BharatVerse's AI Heritage Guide — an expert on Indian culture, heritage, monuments, festivals, arts, history, and traditions.

User question: ${message}

Provide a comprehensive, accurate, and culturally reverent response. Include:
- Historical context and timeline
- Architectural or cultural significance
- Regional variations if applicable
- Interesting lesser-known facts
- Related monuments/festivals the user might enjoy

Format your response with clear sections using markdown. Keep it informative yet engaging. If the question is unrelated to Indian heritage, politely redirect to cultural topics.`;

  const response = await fetch(GEMINI_REST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Gemini API error ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I found some cultural details, but couldn't format a full response.";

  return {
    text,
    _source: "gemini",
    sources: [{ title: "BharatVerse × Gemini Flash AI", state: "India", category: "heritage" }],
    quickActions: [
      { label: "Take 360° Virtual Tour", type: "360tour" },
      { label: "Locate on Heritage Map", type: "map" },
      { label: "Cultural Quiz Arena", type: "quiz" },
    ],
    cards: [],
  };
}

// ---------------------------------------------------------------------------
// 1. LangGraph + RAG + MCP Backend (Express on port 5000)
// ---------------------------------------------------------------------------
async function callBackendSSE(message, onStatus) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    onStatus("🔍 Searching RAG knowledge base...");

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok || !response.body) {
      throw new Error(`Backend returned ${response.status}`);
    }

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
          if (line.startsWith("event: ")) eventType = line.replace("event: ", "").trim();
          else if (line.startsWith("data: ")) dataStr = line.replace("data: ", "").trim();
        }

        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            if (eventType === "status" && parsed.status) onStatus(parsed.status);
            else if (eventType === "complete") completedData = parsed;
          } catch (_) {
            // Ignore partial JSON
          }
        }
      }
    }

    if (completedData) {
      return { ...completedData, _source: "rag_backend" };
    }
    throw new Error("Backend stream ended without completion event");
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Main exported function — never throws, always returns a valid response
// ---------------------------------------------------------------------------
export async function sendAgentMessage({ message, onStatus = () => {} }) {
  // --- Attempt 1: Backend LangGraph + RAG + MCP Agent ---
  try {
    const result = await callBackendSSE(message, onStatus);
    return result; // _source: "rag_backend"
  } catch (backendErr) {
    console.warn("[AgentService] Backend unavailable:", backendErr.message);
    onStatus("✨ Using Gemini AI...");
  }

  // --- Attempt 2: Client-side Gemini REST ---
  try {
    const result = await callGeminiREST(message, onStatus);
    return result; // _source: "gemini"
  } catch (geminiErr) {
    console.warn("[AgentService] Gemini REST failed:", geminiErr.message);
    onStatus("📚 Using offline knowledge base...");
  }

  // --- Attempt 3: Rich offline fallback (never throws) ---
  const offline = getOfflineResponse(message);
  return {
    ...offline,
    _source: "offline",
    quickActions: [
      { label: "Take 360° Virtual Tour", type: "360tour" },
      { label: "Locate on Heritage Map", type: "map" },
      { label: "Cultural Quiz Arena", type: "quiz" },
    ],
    cards: [],
  };
}
