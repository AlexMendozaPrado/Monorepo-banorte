import { NextRequest, NextResponse } from "next/server";
import { makeEmbeddingGenerator, makeVectorStore } from "@/composition/rag-container";
import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/debug/rag
 *
 * Diagnostic endpoint for RAG system
 * Tests embeddings, vector search, and similarity matching
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  const supabase = getSupabaseClient();
  const embeddingGenerator = makeEmbeddingGenerator();
  const vectorStore = makeVectorStore();

  try {
    // Test 1: Check documents count
    console.log("Test 1: Checking documents...");
    const { count: totalDocs, error: countError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (countError) {
      results.tests.push({
        name: "Document Count",
        status: "error",
        error: countError.message,
      });
    } else {
      results.tests.push({
        name: "Document Count",
        status: "success",
        totalDocuments: totalDocs,
      });
    }

    // Test 2: Check sample documents with embeddings
    console.log("Test 2: Checking sample embeddings...");
    const { data: sampleDocs, error: sampleError } = await supabase
      .from("documents")
      .select("id, title, content, embedding, chunk_index")
      .limit(3);

    if (sampleError) {
      results.tests.push({
        name: "Sample Documents",
        status: "error",
        error: sampleError.message,
      });
    } else {
      const embeddingCheck = sampleDocs?.map((doc) => {
        let embeddingInfo: {
          hasEmbedding: boolean;
          dimensions: number;
          type: string;
        } = {
          hasEmbedding: false,
          dimensions: 0,
          type: typeof doc.embedding,
        };

        if (doc.embedding) {
          try {
            const embArray = Array.isArray(doc.embedding)
              ? doc.embedding
              : typeof doc.embedding === "string"
                ? JSON.parse(doc.embedding)
                : null;

            if (embArray && Array.isArray(embArray)) {
              embeddingInfo.hasEmbedding = true;
              embeddingInfo.dimensions = embArray.length;
            }
          } catch (e) {
            embeddingInfo.type = "parse_error";
          }
        }

        return {
          title: doc.title,
          contentPreview: doc.content.substring(0, 50) + "...",
          chunkIndex: doc.chunk_index,
          ...embeddingInfo,
        };
      });

      results.tests.push({
        name: "Sample Documents",
        status: "success",
        documents: embeddingCheck,
      });
    }

    // Test 3: Generate test query embedding
    console.log("Test 3: Generating test query embedding...");
    const testQuery = "información documento contenido";
    let queryEmbedding: number[] = [];

    try {
      const embResult = await embeddingGenerator.generateEmbedding(testQuery);
      queryEmbedding = embResult.embedding;

      results.tests.push({
        name: "Query Embedding Generation",
        status: "success",
        query: testQuery,
        dimensions: embResult.embedding.length,
        model: embResult.metadata.model,
      });
    } catch (error) {
      results.tests.push({
        name: "Query Embedding Generation",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(results);
    }

    // Test 4: Test vector search with different thresholds
    console.log("Test 4: Testing similarity search...");
    const thresholds = [0.0, 0.3, 0.5, 0.7, 0.9];
    const searchResults = [];

    for (const threshold of thresholds) {
      try {
        const searchResult = await vectorStore.searchSimilar(queryEmbedding, {
          maxResults: 5,
          similarityThreshold: threshold,
        });

        searchResults.push({
          threshold,
          resultsFound: searchResult.chunks.length,
          topSimilarities:
            searchResult.chunks.length > 0
              ? searchResult.chunks
                  .slice(0, 3)
                  .map((c) => ({
                    title: c.chunk.title,
                    similarity: c.similarity,
                  }))
              : [],
        });
      } catch (error) {
        searchResults.push({
          threshold,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    results.tests.push({
      name: "Similarity Search",
      status: "success",
      searchResults,
    });

    // Test 5: Direct RPC call test
    console.log("Test 5: Testing match_documents RPC...");
    const queryEmbeddingStr = `[${queryEmbedding.join(",")}]`;

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbeddingStr,
        match_threshold: 0.5,
        match_count: 3,
      });

      if (rpcError) {
        results.tests.push({
          name: "RPC match_documents",
          status: "error",
          error: rpcError.message,
        });
      } else {
        results.tests.push({
          name: "RPC match_documents",
          status: "success",
          resultsFound: rpcData?.length || 0,
          results: rpcData?.slice(0, 3).map((r: any) => ({
            title: r.title,
            similarity: r.similarity,
          })),
        });
      }
    } catch (error) {
      results.tests.push({
        name: "RPC match_documents",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Summary
    const successCount = results.tests.filter((t: any) => t.status === "success").length;
    const totalTests = results.tests.length;

    results.summary = {
      totalTests,
      passed: successCount,
      failed: totalTests - successCount,
      status: successCount === totalTests ? "✅ All tests passed" : "⚠️ Some tests failed",
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("[Debug RAG] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        results,
      },
      { status: 500 }
    );
  }
}
