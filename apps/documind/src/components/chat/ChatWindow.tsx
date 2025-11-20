"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Paper, IconButton, Stack, Alert, Button, Divider } from "@mui/material";
import { Close, Delete, Refresh } from "@mui/icons-material";
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

/**
 * Chat window props
 */
export interface ChatWindowProps {
  onClose: () => void;
  parentDocumentId?: string;
}

/**
 * ChatWindow Component
 * Main chat interface using Vercel AI SDK's useChat hook
 * Manages conversation state and streaming responses
 *
 * @see https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
 */
export function ChatWindow({ onClose, parentDocumentId }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  /**
   * useChat hook from Vercel AI SDK v5
   * Automatically handles:
   * - Message state management
   * - Streaming responses
   * - Loading states
   * - Error handling
   */
  const {
    messages,
    sendMessage,
    status,
    error,
    regenerate,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      parentDocumentId, // Pass to API for document filtering
    },
  });

  // Check if chat is loading
  const isLoading = status === "submitted" || status === "streaming";

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Send message using AI SDK v5 pattern
    sendMessage({ text: trimmedInput });
    setInput(""); // Clear input after sending
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  /**
   * Handle clearing all messages
   */
  const handleClear = () => {
    setMessages([]);
  };

  /**
   * Check if chat has any messages
   */
  const hasMessages = messages.length > 0;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 420,
        height: 600,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        zIndex: 1300,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Asistente Banorte
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {hasMessages && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{ color: "inherit" }}
              title="Limpiar conversación"
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "inherit" }}
            title="Cerrar"
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "grey.50",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!hasMessages && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 3,
            }}
          >
            <Typography variant="h6" gutterBottom color="text.secondary">
              ¡Hola! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Soy tu asistente virtual. Puedo ayudarte a responder preguntas sobre los documentos que has subido.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Escribe tu pregunta abajo para comenzar.
            </Typography>
          </Box>
        )}

        {hasMessages &&
          messages.map((message) => {
            // Extract context chunks from headers (if available)
            const contextChunks = message.metadata?.contextChunks;

            // Convert content to parts format if needed
            const parts = message.parts || (message.content ? [{ type: "text" as const, text: message.content }] : []);

            return (
              <ChatMessage
                key={message.id}
                role={message.role}
                parts={parts}
                contextDocuments={contextChunks}
              />
            );
          })}

        {/* Error Display */}
        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" startIcon={<Refresh />} onClick={() => regenerate()}>
                Reintentar
              </Button>
            }
            sx={{ mt: 2 }}
          >
            {error.message || "Ocurrió un error al procesar tu mensaje"}
          </Alert>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "secondary.main",
                flexShrink: 0,
              }}
            />
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 2,
                borderTopLeftRadius: 0,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {status === "submitted" ? "Buscando documentos relevantes..." : "Escribiendo..."}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <ChatInput
        onSubmit={handleSubmit}
        disabled={isLoading}
        placeholder="Pregunta sobre tus documentos..."
        value={input}
        onChange={handleInputChange}
      />
    </Paper>
  );
}
