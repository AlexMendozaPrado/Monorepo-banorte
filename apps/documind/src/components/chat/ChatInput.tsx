"use client";

import React, { KeyboardEvent } from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Send } from "@mui/icons-material";

/**
 * Chat input props
 */
export interface ChatInputProps {
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ChatInput Component
 * Input field with send button for chat messages
 */
export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = "Escribe tu pregunta...",
  value,
  onChange,
}: ChatInputProps) {
  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Create a synthetic form event
      const formEvent = new Event("submit", { cancelable: true, bubbles: true });
      onSubmit(formEvent as any);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
          },
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={disabled || !value.trim()}
        sx={{
          alignSelf: "flex-end",
        }}
      >
        {disabled ? <CircularProgress size={24} /> : <Send />}
      </IconButton>
    </Box>
  );
}
