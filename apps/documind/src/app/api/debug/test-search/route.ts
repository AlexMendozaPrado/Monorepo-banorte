import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { makeEmbeddingGenerator } from "@/composition/rag-container";

export const runtime = "nodejs";

/**
 * GET /api/debug/test-search
 *
 * Test direct database query with embeddings
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  const embeddingGenerator = makeEmbeddingGenerator();

  try {
    // 1. Check a sample document
    console.log("1. Fetching sample document...");
    const { data: sampleDoc, error: sampleError } = await supabase
      .from("documents")
      .select("id, title, embedding")
      .limit(1)
      .single();

    if (sampleError) {
      return NextResponse.json({ error: sampleError.message }, { status: 500 });
    }

    console.log("Sample doc:", sampleDoc?.title);
    console.log("Embedding exists:", !!sampleDoc?.embedding);
    console.log("Embedding type:", typeof sampleDoc?.embedding);

    // 2. Generate test query embedding
    console.log("\n2. Generating test embedding...");
    const testQuery = "recomendaciones financieras";
    const { embedding: queryEmbedding } = await embeddingGenerator.generateEmbedding(testQuery);

    console.log("Query embedding length:", queryEmbedding.length);
    console.log("Query embedding first values:", queryEmbedding.slice(0, 5));

    // 3. Try different formats of calling the RPC
    console.log("\n3. Testing RPC with string format...");
    const queryEmbeddingStr = `[${queryEmbedding.join(",")}]`;

    const { data: rpcResult1, error: rpcError1 } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbeddingStr,
      match_threshold: 0.0,  // Very low threshold
      match_count: 5,
    });

    console.log("RPC with string format - Results:", rpcResult1?.length || 0);
    if (rpcError1) console.error("RPC Error 1:", rpcError1);

    // 4. Try with direct SQL query
    console.log("\n4. Testing direct SQL query...");
    const { data: directResult, error: directError } = await supabase
      .rpc('sql', {
        query: `
          SELECT
            id,
            title,
            1 - (embedding <=> '${queryEmbeddingStr}'::vector) as similarity
          FROM documents
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> '${queryEmbeddingStr}'::vector
          LIMIT 5
        `
      });

    console.log("Direct SQL - Results:", directResult?.length || 0);
    if (directError) console.error("Direct SQL Error:", directError);

    // 5. Check if embeddings are actually NULL
    console.log("\n5. Counting NULL embeddings...");
    const { count: totalCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    const { count: withEmbeddings } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .not("embedding", "is", null);

    return NextResponse.json({
      sampleDocument: {
        id: sampleDoc?.id,
        title: sampleDoc?.title,
        hasEmbedding: !!sampleDoc?.embedding,
        embeddingType: typeof sampleDoc?.embedding,
      },
      queryEmbedding: {
        query: testQuery,
        dimensions: queryEmbedding.length,
        format: "string",
        preview: queryEmbedding.slice(0, 5),
      },
      rpcTest: {
        format: "string [1,2,3]",
        resultsCount: rpcResult1?.length || 0,
        error: rpcError1?.message || null,
        topResults: rpcResult1?.slice(0, 3).map((r: any) => ({
          title: r.title,
          similarity: r.similarity,
        })),
      },
      directSqlTest: {
        resultsCount: directResult?.length || 0,
        error: directError?.message || null,
      },
      embeddingStats: {
        totalDocuments: totalCount,
        documentsWithEmbeddings: withEmbeddings,
        documentsWithoutEmbeddings: (totalCount || 0) - (withEmbeddings || 0),
      },
    });
  } catch (error) {
    console.error("[Debug Test Search] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
