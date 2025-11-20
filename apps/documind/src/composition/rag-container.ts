/**
 * RAG Dependency Injection Container
 *
 * This file implements the Dependency Injection pattern for RAG functionality.
 * It creates and wires together all the components following Clean Architecture.
 *
 * Flow: Domain <- Application <- Infrastructure <- Composition
 */

import { getOpenAI, getOpenAIEmbeddingModel, getRagChunkSize, getRagChunkOverlap } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase";

// Infrastructure implementations
import { RecursiveTextChunker } from "@/infrastructure/chunking/RecursiveTextChunker";
import { OpenAIEmbeddingGenerator } from "@/infrastructure/embeddings/OpenAIEmbeddingGenerator";
import { SupabaseVectorStore } from "@/infrastructure/vector-store/SupabaseVectorStore";
import { OpenAIChatService } from "@/infrastructure/llm/OpenAIChatService";

// Application use cases
import { StoreDocumentUseCase } from "@/core/application/chat/use-cases/StoreDocumentUseCase";
import { ChatWithDocsUseCase } from "@/core/application/chat/use-cases/ChatWithDocsUseCase";

/**
 * Factory function to create StoreDocumentUseCase with all dependencies
 * This is the entry point for storing documents with embeddings
 */
export function makeStoreDocumentUseCase(): StoreDocumentUseCase {
  // 1. Create infrastructure adapters
  const chunker = new RecursiveTextChunker();

  const openai = getOpenAI();
  const embeddingModel = getOpenAIEmbeddingModel();
  const embeddingGenerator = new OpenAIEmbeddingGenerator(openai, embeddingModel);

  const supabase = getSupabaseClient();
  const vectorStore = new SupabaseVectorStore(supabase);

  // 2. Create and return use case with injected dependencies
  return new StoreDocumentUseCase(chunker, embeddingGenerator, vectorStore);
}

/**
 * Factory function to create ChatWithDocsUseCase with all dependencies
 * This is the entry point for RAG chat functionality
 */
export function makeChatWithDocsUseCase(): ChatWithDocsUseCase {
  // 1. Create infrastructure adapters
  const openai = getOpenAI();
  const embeddingModel = getOpenAIEmbeddingModel();
  const embeddingGenerator = new OpenAIEmbeddingGenerator(openai, embeddingModel);

  const supabase = getSupabaseClient();
  const vectorStore = new SupabaseVectorStore(supabase);

  const chatService = new OpenAIChatService();

  // 2. Create and return use case with injected dependencies
  return new ChatWithDocsUseCase(embeddingGenerator, vectorStore, chatService);
}

/**
 * Factory function to get chunker configuration
 * Useful for testing or custom chunking scenarios
 */
export function makeChunker() {
  return new RecursiveTextChunker();
}

/**
 * Factory function to get embedding generator
 * Useful for standalone embedding generation
 */
export function makeEmbeddingGenerator() {
  const openai = getOpenAI();
  const embeddingModel = getOpenAIEmbeddingModel();
  return new OpenAIEmbeddingGenerator(openai, embeddingModel);
}

/**
 * Factory function to get vector store
 * Useful for direct database operations
 */
export function makeVectorStore() {
  const supabase = getSupabaseClient();
  return new SupabaseVectorStore(supabase);
}

/**
 * Factory function to get chat service
 * Useful for standalone chat without RAG
 */
export function makeChatService() {
  return new OpenAIChatService();
}

/**
 * Get chunking configuration from environment
 */
export function getChunkingConfig() {
  return {
    chunkSize: getRagChunkSize(),
    chunkOverlap: getRagChunkOverlap(),
  };
}
