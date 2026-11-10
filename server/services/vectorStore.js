import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from BharatVerse-master root
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Cache file path
const CACHE_DIR = path.resolve(__dirname, "../cache");
const CACHE_FILE = path.join(CACHE_DIR, "vector_cache.json");

export class CulturalVectorStore {
  constructor() {
    this.documents = [];
    this.isInitialized = false;
    this.genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
  }

  /**
   * Cosine similarity between two vectors
   */
  static cosineSimilarity(vecA, vecB) {
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Lightweight semantic feature vector (deterministic fallback if API key or network is unavailable)
   */
  static getFallbackVector(text) {
    const vector = new Array(64).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const words = cleaned.split(/\s+/).filter(Boolean);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % 64;
      vector[idx] += 1;
    }

    // Normalize
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  /**
   * Generates embedding using Gemini text-embedding-004, or falls back to feature vector
   */
  async getEmbedding(text) {
    if (!this.genAI) {
      return CulturalVectorStore.getFallbackVector(text);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
      return CulturalVectorStore.getFallbackVector(text);
    } catch (err) {
      // Fallback silently if embedding fails or quota exceeded
      return CulturalVectorStore.getFallbackVector(text);
    }
  }

  /**
   * Ingest datasets from src/data
   */
  async initialize() {
    if (this.isInitialized) return;

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    // Try loading from cached vectors
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        this.documents = JSON.parse(raw);
        this.isInitialized = true;
        console.log(`[VectorStore] Loaded ${this.documents.length} cached cultural embeddings.`);
        return;
      } catch (err) {
        console.warn("[VectorStore] Cache corrupted, regenerating embeddings...", err.message);
      }
    }

    console.log("[VectorStore] Ingesting BharatVerse cultural datasets...");
    const dataDir = path.resolve(__dirname, "../../src/data");

    const rawHiddenGems = this.readJsonSafe(path.join(dataDir, "hiddengems.json")) || [];
    const rawHeritage = this.readJsonSafe(path.join(dataDir, "heritage.json")) || [];
    const rawFestivals = this.readJsonSafe(path.join(dataDir, "festivals.json")) || [];
    const rawArts = this.readJsonSafe(path.join(dataDir, "arts.json")) || [];

    const docsToEmbed = [];

    // 1. Process Hidden Gems
    for (const item of rawHiddenGems) {
      const content = `
Site: ${item.title}
Type: Hidden Gem (${item.category || "Heritage"})
Location: ${item.location || ""}, ${item.state || ""}
Significance: ${item.cultural_significance || item.description || ""}
Best Time: ${item.best_time_visit || ""}
Access & Tips: ${item.how_to_reach || ""} ${item.local_tips || ""}
Nearby: ${(item.nearby_attractions || []).join(", ")}
      `.trim();

      docsToEmbed.push({
        id: `gem-${item.id}`,
        title: item.title,
        category: "hidden_gem",
        state: item.state,
        rating: item.rating || 4.8,
        content: content,
        metadata: {
          location: item.location,
          difficulty: item.difficulty,
          best_time: item.best_time_visit,
        },
      });
    }

    // 2. Process Heritage Sites
    for (const item of rawHeritage) {
      const content = `
Monument: ${item.title}
State: ${item.state}
Overview: ${item.description}
Architectural Importance: Iconic Indian heritage and monument of national pride.
Rating: ${item.rating}/5
      `.trim();

      docsToEmbed.push({
        id: `heritage-${item.id}`,
        title: item.title,
        category: "monument",
        state: item.state,
        rating: item.rating || 5,
        content: content,
        metadata: {
          imageKey: item.imageKey,
        },
      });
    }

    // 3. Process Festivals
    for (const item of rawFestivals) {
      const content = `
Festival: ${item.name || item.title}
State/Region: ${item.state || item.region || "All India"}
Month: ${item.month || item.timing || ""}
Significance & Rituals: ${item.significance || item.description || ""}
Traditions: ${item.traditions || item.rituals || ""}
      `.trim();

      docsToEmbed.push({
        id: `fest-${item.id || item.name}`,
        title: item.name || item.title,
        category: "festival",
        state: item.state || "India",
        content: content,
        metadata: {
          month: item.month,
        },
      });
    }

    // 4. Process Arts & Living Traditions
    for (const item of rawArts) {
      const content = `
Art Form / Tradition: ${item.name || item.title}
Category: ${item.category || "Folk Art"}
Origin: ${item.state || item.origin || "India"}
Techniques & History: ${item.description || item.history || ""}
Cultural Meaning: ${item.culturalSignificance || item.significance || ""}
      `.trim();

      docsToEmbed.push({
        id: `art-${item.id || item.name}`,
        title: item.name || item.title,
        category: "art",
        state: item.state || item.origin || "India",
        content: content,
        metadata: {
          category: item.category,
        },
      });
    }

    console.log(`[VectorStore] Generating embeddings for ${docsToEmbed.length} documents...`);

    // Generate embeddings
    for (const doc of docsToEmbed) {
      doc.vector = await this.getEmbedding(doc.content);
      this.documents.push(doc);
    }

    // Save cache
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.documents), "utf-8");
      console.log(`[VectorStore] Cached ${this.documents.length} vectors to disk.`);
    } catch (e) {
      console.warn("[VectorStore] Failed to write cache file:", e.message);
    }

    this.isInitialized = true;
  }

  readJsonSafe(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  /**
   * Similarity search across vector space
   */
  async search(query, topK = 4, filter = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const queryVector = await this.getEmbedding(query);
    const queryLower = query.toLowerCase();

    const scored = this.documents
      .filter((doc) => {
        if (filter.category && doc.category !== filter.category) return false;
        if (filter.state && doc.state && !doc.state.toLowerCase().includes(filter.state.toLowerCase())) {
          return false;
        }
        return true;
      })
      .map((doc) => {
        // Base cosine similarity
        let score = 0;
        if (doc.vector && doc.vector.length === queryVector.length) {
          score = CulturalVectorStore.cosineSimilarity(queryVector, doc.vector);
        }

        // Keyword boost for direct title matches
        if (doc.title && queryLower.includes(doc.title.toLowerCase())) {
          score += 0.35;
        }
        if (doc.state && queryLower.includes(doc.state.toLowerCase())) {
          score += 0.15;
        }

        return { doc, score };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((item) => ({
      ...item.doc,
      score: item.score,
    }));
  }
}

// Singleton instance
export const vectorStore = new CulturalVectorStore();

