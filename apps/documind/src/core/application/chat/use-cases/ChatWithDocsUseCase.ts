import { EmbeddingGeneratorPort } from "@/core/domain/chat/ports/EmbeddingGeneratorPort";
import { VectorStorePort } from "@/core/domain/chat/ports/VectorStorePort";
import { ChatServicePort } from "@/core/domain/chat/ports/ChatServicePort";
import { ChatMessage } from "@/core/domain/chat/ChatMessage";
import { createChatContext } from "@/core/domain/chat/ChatContext";
import { ChatPromptBuilder } from "../services/ChatPromptBuilder";
import { ContextAssembler } from "../services/ContextAssembler";

/**
 * Use Case: Chat with Documents (RAG)
 *
 * This use case orchestrates the RAG (Retrieval-Augmented Generation) flow:
 * 1. Generate embedding for the user's question
 * 2. Search for similar document chunks in the vector store
 * 3. Assemble context with relevant chunks
 * 4. Build prompt with context
 * 5. Generate response using LLM with streaming
 *
 * Follows Clean Architecture principles by depending only on ports (interfaces)
 */
export interface ChatWithDocsInput {
  /** User's question */
  question: string;

  /** Optional conversation history */
  conversationHistory?: ChatMessage[];

  /** Optional filter by parent document ID */
  parentDocumentId?: string;

  /** Configuration */
  config?: {
    /** Maximum number of relevant chunks to retrieve */
    maxChunks?: number;

    /** Minimum similarity threshold (0-1) */
    minSimilarity?: number;

    /** Enable streaming response */
    stream?: boolean;

    /** Chat model to use */
    model?: string;

    /** Temperature for response generation */
    temperature?: number;

    /** Maximum tokens for response */
    maxTokens?: number;
  };
}

export interface ChatWithDocsOutput {
  /** The assistant's response */
  response: ChatMessage;

  /** Relevant document chunks used for context */
  contextChunks: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;

  /** Statistics about the operation */
  stats: {
    /** Number of relevant chunks found */
    relevantChunksCount: number;

    /** Average similarity of chunks */
    averageSimilarity: number;

    /** Total tokens used */
    totalTokens?: number;

    /** Time taken in milliseconds */
    timeTaken: number;
  };
}

export interface ChatWithDocsStreamOutput {
  /** Stream of response text */
  stream: ReadableStream<string>;

  /** Relevant document chunks used for context */
  contextChunks: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;

  /** Statistics about the operation */
  stats: {
    /** Number of relevant chunks found */
    relevantChunksCount: number;

    /** Average similarity of chunks */
    averageSimilarity: number;

    /** Time taken to prepare (not including streaming time) */
    preparationTime: number;
  };
}

export class ChatWithDocsUseCase {
  private readonly promptBuilder: ChatPromptBuilder;
  private readonly contextAssembler: ContextAssembler;

  constructor(
    private readonly embeddingGenerator: EmbeddingGeneratorPort,
    private readonly vectorStore: VectorStorePort,
    private readonly chatService: ChatServicePort
  ) {
    this.promptBuilder = new ChatPromptBuilder();
    this.contextAssembler = new ContextAssembler();
  }

  /**
   * Execute chat with streaming response
   */
  async executeStream(
    input: ChatWithDocsInput
  ): Promise<ChatWithDocsStreamOutput> {
    const startTime = Date.now();

    try {
      // Step 1: Get relevant context
      const { context, contextChunks, stats } = await this.getRelevantContext(
        input
      );

      // Step 2: Build messages with context
      console.log(`[ChatWithDocsUseCase] Building RAG prompt...`);
      const messages = this.promptBuilder.buildRAGMessages(
        input.question,
        context.relevantChunks,
        input.conversationHistory
      );

      // Step 3: Generate streaming response
      console.log(`[ChatWithDocsUseCase] Generating streaming response...`);
      const streamResponse = await this.chatService.chatStream(messages, {
        model: input.config?.model,
        temperature: input.config?.temperature,
        maxTokens: input.config?.maxTokens,
      });

      const preparationTime = Date.now() - startTime;

      return {
        stream: streamResponse.stream,
        contextChunks,
        stats: {
          relevantChunksCount: stats.relevantChunksCount,
          averageSimilarity: stats.averageSimilarity,
          preparationTime,
        },
      };
    } catch (error) {
      console.error("[ChatWithDocsUseCase] Error:", error);
      throw new Error(
        `Failed to chat with documents: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Execute chat with non-streaming response
   */
  async execute(input: ChatWithDocsInput): Promise<ChatWithDocsOutput> {
    const startTime = Date.now();

    try {
      // Step 1: Get relevant context
      const { context, contextChunks, stats } = await this.getRelevantContext(
        input
      );

      // Step 2: Build messages with context
      console.log(`[ChatWithDocsUseCase] Building RAG prompt...`);
      const messages = this.promptBuilder.buildRAGMessages(
        input.question,
        context.relevantChunks,
        input.conversationHistory
      );

      // Step 3: Generate response
      console.log(`[ChatWithDocsUseCase] Generating response...`);
      const chatResponse = await this.chatService.chat(messages, {
        model: input.config?.model,
        temperature: input.config?.temperature,
        maxTokens: input.config?.maxTokens,
      });

      const timeTaken = Date.now() - startTime;

      return {
        response: chatResponse.message,
        contextChunks,
        stats: {
          relevantChunksCount: stats.relevantChunksCount,
          averageSimilarity: stats.averageSimilarity,
          totalTokens: chatResponse.metadata.totalTokens,
          timeTaken,
        },
      };
    } catch (error) {
      console.error("[ChatWithDocsUseCase] Error:", error);
      throw new Error(
        `Failed to chat with documents: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Helper method to retrieve relevant context
   */
  private async getRelevantContext(input: ChatWithDocsInput) {
    // Step 1: Generate embedding for the question
    console.log(`[ChatWithDocsUseCase] Generating question embedding...`);
    const embeddingResult = await this.embeddingGenerator.generateEmbedding(
      input.question
    );

    // Step 2: Search for similar chunks
    console.log(`[ChatWithDocsUseCase] Searching for similar documents...`);
    const searchResult = await this.vectorStore.searchSimilar(
      embeddingResult.embedding,
      {
        maxResults: input.config?.maxChunks || 5,
        similarityThreshold: input.config?.minSimilarity || 0.7,
        parentDocumentId: input.parentDocumentId,
      }
    );

    console.log(
      `[ChatWithDocsUseCase] Found ${searchResult.chunks.length} relevant chunks`
    );

    // Step 3: Assemble context
    const context = createChatContext({
      messages: input.conversationHistory || [],
      relevantChunks: searchResult.chunks,
      config: {
        maxChunks: input.config?.maxChunks,
        minSimilarity: input.config?.minSimilarity,
      },
    });

    const assembledContext = this.contextAssembler.assembleContext(
      context,
      searchResult.chunks
    );

    // Calculate stats
    const contextStats = this.contextAssembler.getContextStats(assembledContext);

    const contextChunks = assembledContext.relevantChunks.map((item) => ({
      id: item.chunk.id,
      title: item.chunk.title,
      similarity: item.similarity,
    }));

    return {
      context: assembledContext,
      contextChunks,
      stats: {
        relevantChunksCount: contextStats.chunkCount,
        averageSimilarity: contextStats.averageSimilarity,
      },
    };
  }
}
