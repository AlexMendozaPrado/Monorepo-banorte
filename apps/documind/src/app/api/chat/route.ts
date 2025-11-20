import { NextRequest } from "next/server";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { makeEmbeddingGenerator, makeVectorStore } from "@/composition/rag-container";
import { getChatModel, getChatTemperature, getChatMaxTokens, getRagMaxResults, getRagSimilarityThreshold } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/chat
 *
 * Chat with documents using RAG (Retrieval-Augmented Generation)
 * Compatible with Vercel AI SDK useChat hook
 *
 * Request Body (from useChat):
 * - messages: UIMessage[] (conversation history)
 * - parentDocumentId?: string (optional body parameter)
 *
 * Response:
 * - Streaming UI message response compatible with useChat
 * - X-Context-Chunks header: JSON array of relevant chunks
 *
 * @see https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, parentDocumentId } = body as {
      messages: UIMessage[];
      parentDocumentId?: string;
    };

    console.log(`[API /chat] DEBUG - parentDocumentId:`, parentDocumentId);
    console.log(`[API /chat] DEBUG - parentDocumentId type:`, typeof parentDocumentId);

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message found" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userQuestion = lastUserMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ");

    console.log(`[API /chat] Processing question: "${userQuestion.substring(0, 50)}..."`);

    // Step 1: Generate embedding for the user's question
    const embeddingGenerator = makeEmbeddingGenerator();
    const embeddingResult = await embeddingGenerator.generateEmbedding(userQuestion);

    console.log(`[API /chat] DEBUG - Testing direct RPC call from chat context`);
    const supabase = (await import("@/lib/supabase")).getSupabaseClient();
    const queryEmbeddingStr = `[${embeddingResult.embedding.join(",")}]`;
    const { data: testData, error: testError } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbeddingStr,
      match_threshold: 0.3,
      match_count: 5,
    });
    console.log(`[API /chat] DEBUG - Direct RPC result:`, testData?.length || 0, "documents");
    if (testError) console.error(`[API /chat] DEBUG - Direct RPC error:`, testError);

    // Step 2: Search for similar documents
    const vectorStore = makeVectorStore();
    const searchResult = await vectorStore.searchSimilar(embeddingResult.embedding, {
      maxResults: getRagMaxResults(),
      similarityThreshold: getRagSimilarityThreshold(),
      parentDocumentId,
    });

    console.log(
      `[API /chat] Found ${searchResult.chunks.length} relevant chunks`
    );

    // Step 3: Build context from relevant chunks
    let systemPrompt = `Eres un asistente virtual inteligente especializado en analizar y responder preguntas sobre documentos.

Tu trabajo es:
1. Responder preguntas basándote ÚNICAMENTE en el contexto proporcionado
2. Si la información no está en el contexto, di claramente que no tienes esa información
3. Citar las secciones relevantes del contexto cuando sea apropiado
4. Ser preciso, claro y conciso en tus respuestas
5. Mantener un tono profesional y amigable

IMPORTANTE:
- NO inventes información que no esté en el contexto
- Si no estás seguro, dilo claramente
- Puedes hacer inferencias razonables basadas en el contexto proporcionado`;

    if (searchResult.chunks.length > 0) {
      const contextSections = searchResult.chunks
        .map((item, index) => {
          return `[Documento ${index + 1}] (Relevancia: ${Math.round(item.similarity * 100)}%)
Título: ${item.chunk.title}
Contenido:
${item.chunk.content}`;
        })
        .join("\n\n---\n\n");

      systemPrompt += `\n\nContexto relevante de los documentos:\n\n${contextSections}`;
    } else {
      systemPrompt += `\n\nNOTA: No se encontraron documentos relevantes para esta pregunta. Por favor, indica al usuario que no tienes información sobre este tema en los documentos almacenados.`;
    }

    // Step 4: Convert messages to model format and inject system prompt
    const modelMessages = convertToModelMessages(messages);

    // Add system message at the beginning
    const messagesWithSystem = [
      { role: "system" as const, content: systemPrompt },
      ...modelMessages,
    ];

    // Step 5: Generate streaming response using AI SDK
    const result = streamText({
      model: openai(getChatModel()),
      messages: messagesWithSystem,
      temperature: getChatTemperature(),
      maxOutputTokens: getChatMaxTokens(),
      maxRetries: 2,
      onFinish: ({ text, usage }) => {
        console.log("[API /chat] Stream finished:", {
          textLength: text.length,
          usage,
        });
      },
    });

    // Add context metadata to headers and return streaming response
    // Using toUIMessageStreamResponse() for AI SDK v5 useChat hook compatibility
    return result.toUIMessageStreamResponse({
      headers: {
        "X-Context-Chunks": JSON.stringify(
          searchResult.chunks.map((item) => ({
            id: item.chunk.id,
            title: item.chunk.title,
            similarity: item.similarity,
          }))
        ),
        "X-Relevant-Chunks-Count": searchResult.chunks.length.toString(),
      },
    });
  } catch (error) {
    console.error("[API /chat] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
