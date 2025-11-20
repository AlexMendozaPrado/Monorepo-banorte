import { NextRequest, NextResponse } from "next/server";
import { makeStoreDocumentUseCase } from "@/composition/rag-container";
import { makeAnalyzePdfUseCase } from "@/composition/container";
import { getMaxUploadMB } from "@/lib/env";

export const runtime = "nodejs";

/**
 * POST /api/documents/store
 *
 * Store a PDF document with embeddings in Supabase for RAG
 *
 * Request:
 * - multipart/form-data with "file" field (PDF)
 * - Optional "title" field
 *
 * Response:
 * - document: Stored document metadata
 * - chunkIds: Array of chunk IDs
 * - stats: Processing statistics
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const customTitle = formData.get("title") as string | null;

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

    console.log(`[API /documents/store] Processing file: ${file.name} (${file.size} bytes)`);

    // Step 1: Extract text from PDF using existing analyzer
    const bytes = Buffer.from(await file.arrayBuffer());
    const analyzeUseCase = makeAnalyzePdfUseCase();

    console.log("[API /documents/store] Extracting text from PDF...");
    const { fullText } = await analyzeUseCase["textExtractor"].extractText({
      bytes,
      mime: file.type,
    });

    if (!fullText || fullText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file may be empty or corrupted." },
        { status: 400 }
      );
    }

    console.log(`[API /documents/store] Extracted ${fullText.length} characters`);

    // Step 2: Store document with embeddings
    const storeUseCase = makeStoreDocumentUseCase();

    console.log("[API /documents/store] Storing document with embeddings...");
    const result = await storeUseCase.execute({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fullText,
      title: customTitle || file.name,
      metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log(
      `[API /documents/store] Successfully stored document with ${result.stats.chunkCount} chunks`
    );

    return NextResponse.json({
      success: true,
      document: {
        id: result.document.id,
        title: result.document.title,
        fileName: result.document.fileName,
        fileSize: result.document.fileSize,
        chunkCount: result.document.chunkCount,
        createdAt: result.document.createdAt,
      },
      chunkIds: result.chunkIds,
      stats: result.stats,
    });
  } catch (error) {
    console.error("[API /documents/store] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
