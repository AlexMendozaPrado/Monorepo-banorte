"use client";

import React from "react";
import { Box, Typography, Paper, Chip, Stack } from "@mui/material";
import { Person, SmartToy, Description } from "@mui/icons-material";

/**
 * Chat message part (from AI SDK)
 * Updated for AI SDK v5 which includes reasoning parts
 */
interface MessagePart {
  type: "text" | "tool-call" | "tool-result" | "reasoning";
  text?: string;
  [key: string]: any;
}

/**
 * Chat message props
 */
export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  parts: MessagePart[];
  contextDocuments?: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
}

/**
 * ChatMessage Component
 * Displays a single chat message with role-based styling
 * Compatible with Vercel AI SDK message format
 */
export function ChatMessage({ role, parts, contextDocuments }: ChatMessageProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  // Debug logging
  console.log("[ChatMessage] Rendering message:", { role, parts, contextDocuments });
  console.log("[ChatMessage] Parts type:", typeof parts);
  console.log("[ChatMessage] Parts is array:", Array.isArray(parts));
  console.log("[ChatMessage] Parts content:", JSON.stringify(parts));

  // Extract text content from parts - handle various formats
  let textContent = "";

  if (!parts) {
    console.error("[ChatMessage] Parts is undefined/null");
    return null;
  }

  if (Array.isArray(parts)) {
    textContent = parts
      .filter((part) => part && part.type === "text" && part.text)
      .map((part) => part.text)
      .join("");
  }

  console.log("[ChatMessage] Extracted text content:", textContent);
  console.log("[ChatMessage] Text content length:", textContent.length);

  if (!textContent && !contextDocuments) {
    console.warn("[ChatMessage] No text content or context documents, returning null");
    console.warn("[ChatMessage] Skipping render for role:", role);
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "80%",
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          gap: 1,
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isUser ? "primary.main" : "secondary.main",
            color: "white",
            flexShrink: 0,
          }}
        >
          {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
        </Box>

        {/* Message Content */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isUser ? "primary.light" : "grey.100",
              color: isUser ? "primary.contrastText" : "text.primary",
              borderRadius: 2,
              borderTopLeftRadius: isUser ? 2 : 0,
              borderTopRightRadius: isUser ? 0 : 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {textContent}
            </Typography>

            {/* Context Documents (for assistant messages with RAG) */}
            {isAssistant && contextDocuments && contextDocuments.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Description fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Fuentes consultadas:
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {contextDocuments.map((doc, index) => (
                    <Chip
                      key={doc.id}
                      label={`${doc.title.substring(0, 30)}${doc.title.length > 30 ? "..." : ""} (${Math.round(doc.similarity * 100)}%)`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
