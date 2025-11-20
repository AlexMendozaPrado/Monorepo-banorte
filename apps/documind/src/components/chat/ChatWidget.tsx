"use client";

import React, { useState } from "react";
import { Fab, Badge, Zoom } from "@mui/material";
import { Chat, Close } from "@mui/icons-material";
import { ChatWindow } from "./ChatWindow";

/**
 * Chat widget props
 */
export interface ChatWidgetProps {
  parentDocumentId?: string;
  defaultOpen?: boolean;
}

/**
 * ChatWidget Component
 * Floating action button that toggles the chat window
 * Main entry point for the RAG chat system
 */
export function ChatWidget({ parentDocumentId, defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * Toggle chat window
   */
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Zoom in={!isOpen}>
        <Fab
          color="primary"
          aria-label="Open chat"
          onClick={handleToggle}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1200,
          }}
        >
          <Badge badgeContent={0} color="error">
            <Chat />
          </Badge>
        </Fab>
      </Zoom>

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={handleToggle}
          parentDocumentId={parentDocumentId}
        />
      )}
    </>
  );
}
