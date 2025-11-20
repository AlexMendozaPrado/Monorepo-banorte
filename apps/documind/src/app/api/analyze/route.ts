import { NextRequest, NextResponse } from "next/server";
import { makeAnalyzePdfUseCase } from "@/composition/container";
import { makeStoreDocumentUseCase } from "@/composition/rag-container";
import { getMaxUploadMB } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "generic";

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSizeMB = getMaxUploadMB();
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes = ["generic", "legal", "academic", "finance"];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be one of: generic, legal, academic, finance" },
        { status: 400 }
      );
    }

    console.log(`[API /analyze] Processing file: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const bytes = Buffer.from(await file.arrayBuffer());

    // Step 1: Analyze PDF (extract keywords)
    const useCase = makeAnalyzePdfUseCase();
    const result = await useCase.execute({
      bytes,
      mime: file.type,
      mode: mode as "generic" | "legal" | "academic" | "finance"
    });

    console.log(`[API /analyze] Analysis complete. Found ${result.keywords.length} keywords`);
    console.log(`[API /analyze] Sentiment analysis: ${result.sentimentAnalysis.sentimentScore}/7 (Confidence: ${result.sentimentAnalysis.confidenceLevel}%)`);

    // Step 2: Store document with embeddings for RAG
    try {
      const storeUseCase = makeStoreDocumentUseCase();

      console.log("[API /analyze] Storing document with embeddings for RAG...");
      const storeResult = await storeUseCase.execute({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fullText: result.fullText,
        title: file.name,
        metadata: {
          uploadedAt: new Date().toISOString(),
          mode,
          sentimentScore: result.sentimentAnalysis.sentimentScore,
        },
      });

      console.log(
        `[API /analyze] Document stored successfully with ${storeResult.stats.chunkCount} chunks (ID: ${storeResult.document.id})`
      );

      // Return analysis result with document ID for RAG queries
      return NextResponse.json({
        keywords: result.keywords,
        sentimentAnalysis: result.sentimentAnalysis,
        fullText: result.fullText,
        documentId: storeResult.document.id,
        chunkCount: storeResult.stats.chunkCount,
      });
    } catch (storeError) {
      console.error("[API /analyze] Error storing document for RAG:", storeError);
      // Continue without RAG storage - still return analysis
      console.warn("[API /analyze] Continuing without RAG storage");
      return NextResponse.json({
        keywords: result.keywords,
        sentimentAnalysis: result.sentimentAnalysis,
        fullText: result.fullText,
      });
    }
  } catch (error) {
    console.error("[API /analyze] Error analyzing PDF:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
