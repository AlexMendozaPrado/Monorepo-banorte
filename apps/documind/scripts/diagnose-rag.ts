/**
 * RAG Diagnostic Script
 *
 * This script helps diagnose why vector search is not returning results
 * Run with: npm run diagnose-rag (will be added to package.json)
 */

import { getSupabaseClient } from "@/lib/supabase";
import { makeEmbeddingGenerator } from "@/composition/rag-container";

async function diagnoseRAG() {
  console.log("🔍 Starting RAG Diagnostic...\n");

  const supabase = getSupabaseClient();
  const embeddingGenerator = makeEmbeddingGenerator();

  // Step 1: Check if documents exist
  console.log("1️⃣ Checking documents in database...");
  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("id, title, content, chunk_index, created_at")
    .limit(5);

  if (docsError) {
    console.error("❌ Error fetching documents:", docsError);
    return;
  }

  console.log(`✅ Found ${documents?.length || 0} documents (showing first 5)`);
  documents?.forEach((doc, i) => {
    console.log(`   ${i + 1}. ${doc.title} (chunk ${doc.chunk_index})`);
    console.log(`      Content preview: ${doc.content.substring(0, 100)}...`);
  });
  console.log("");

  // Step 2: Check if embeddings exist
  console.log("2️⃣ Checking embeddings...");
  const { data: embeddingsData, error: embError } = await supabase
    .from("documents")
    .select("id, title, embedding")
    .limit(3);

  if (embError) {
    console.error("❌ Error fetching embeddings:", embError);
    return;
  }

  console.log(`Checking ${embeddingsData?.length || 0} documents for embeddings:`);
  embeddingsData?.forEach((doc) => {
    if (doc.embedding) {
      const embeddingArray = Array.isArray(doc.embedding)
        ? doc.embedding
        : typeof doc.embedding === 'string'
          ? JSON.parse(doc.embedding)
          : null;

      if (embeddingArray && Array.isArray(embeddingArray)) {
        console.log(`   ✅ ${doc.title}: Has embedding with ${embeddingArray.length} dimensions`);
        console.log(`      First 3 values: [${embeddingArray.slice(0, 3).join(', ')}]`);
      } else {
        console.log(`   ❌ ${doc.title}: Invalid embedding format`);
      }
    } else {
      console.log(`   ❌ ${doc.title}: No embedding found!`);
    }
  });
  console.log("");

  // Step 3: Test query embedding generation
  console.log("3️⃣ Testing query embedding generation...");
  const testQuery = "¿Cuál es el contenido del documento?";
  console.log(`   Query: "${testQuery}"`);

  try {
    const queryEmbedding = await embeddingGenerator.generateEmbedding(testQuery);
    console.log(`   ✅ Generated query embedding: ${queryEmbedding.embedding.length} dimensions`);
    console.log(`      Model: ${queryEmbedding.metadata.model}`);
    console.log(`      First 3 values: [${queryEmbedding.embedding.slice(0, 3).join(', ')}]`);
  } catch (error) {
    console.error("   ❌ Error generating query embedding:", error);
    return;
  }
  console.log("");

  // Step 4: Test similarity search with different thresholds
  console.log("4️⃣ Testing similarity search with different thresholds...");

  const thresholds = [0.0, 0.3, 0.5, 0.7, 0.9];
  const queryEmbedding = await embeddingGenerator.generateEmbedding(testQuery);
  const queryEmbeddingStr = `[${queryEmbedding.embedding.join(",")}]`;

  for (const threshold of thresholds) {
    console.log(`\n   Testing threshold: ${threshold}`);

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbeddingStr,
      match_threshold: threshold,
      match_count: 5,
    });

    if (error) {
      console.error(`   ❌ Error with threshold ${threshold}:`, error);
      continue;
    }

    const results = data || [];
    console.log(`   📊 Results: ${results.length} documents found`);

    if (results.length > 0) {
      results.slice(0, 3).forEach((result: any, i: number) => {
        console.log(`      ${i + 1}. Similarity: ${result.similarity.toFixed(4)} - ${result.title}`);
      });
    }
  }
  console.log("");

  // Step 5: Check the match_documents function exists
  console.log("5️⃣ Checking if match_documents function exists...");
  const { data: functions, error: funcError } = await supabase
    .rpc('match_documents', {
      query_embedding: queryEmbeddingStr,
      match_threshold: 0.0,
      match_count: 1,
    });

  if (funcError) {
    console.error("   ❌ match_documents function error:", funcError);
    console.log("   💡 You may need to run the database migration again");
  } else {
    console.log("   ✅ match_documents function is working");
  }
  console.log("");

  // Step 6: Direct similarity calculation test
  console.log("6️⃣ Testing direct cosine similarity...");

  const { data: sampleDoc, error: sampleError } = await supabase
    .from("documents")
    .select("id, title, embedding")
    .limit(1)
    .single();

  if (!sampleError && sampleDoc && sampleDoc.embedding) {
    const docEmbedding = Array.isArray(sampleDoc.embedding)
      ? sampleDoc.embedding
      : JSON.parse(sampleDoc.embedding);

    // Calculate cosine similarity manually
    const similarity = cosineSimilarity(queryEmbedding.embedding, docEmbedding);
    console.log(`   Cosine similarity with "${sampleDoc.title}": ${similarity.toFixed(4)}`);
    console.log(`   💡 Typical good matches are above 0.3-0.4`);
  }

  console.log("\n✨ Diagnostic complete!");
}

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Run the diagnostic
diagnoseRAG().catch(console.error);
