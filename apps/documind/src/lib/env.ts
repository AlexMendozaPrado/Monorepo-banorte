import OpenAI from "openai";

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  return new OpenAI({
    apiKey
  });
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

export function getMaxUploadMB(): number {
  return parseInt(process.env.MAX_UPLOAD_MB || "20", 10);
}

// === RAG Configuration ===

export function getOpenAIEmbeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
}

export function getRagChunkSize(): number {
  return parseInt(process.env.RAG_CHUNK_SIZE || "1000", 10);
}

export function getRagChunkOverlap(): number {
  return parseInt(process.env.RAG_CHUNK_OVERLAP || "200", 10);
}

export function getRagMaxResults(): number {
  return parseInt(process.env.RAG_MAX_RESULTS || "5", 10);
}

export function getRagSimilarityThreshold(): number {
  return parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.7");
}

// === Chat Configuration ===

export function getChatModel(): string {
  return process.env.CHAT_MODEL || "gpt-4o";
}

export function getChatMaxTokens(): number {
  return parseInt(process.env.CHAT_MAX_TOKENS || "2000", 10);
}

export function getChatTemperature(): number {
  return parseFloat(process.env.CHAT_TEMPERATURE || "0.7");
}
