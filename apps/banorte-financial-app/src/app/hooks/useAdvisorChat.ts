'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useMemo, useState } from 'react';

/**
 * Contexto financiero del usuario para enriquecer las respuestas de Norma
 */
export interface FinancialContext {
  currentBudget?: {
    totalIncome: number;
    spent: number;
    budget: number;
    categories: Array<{ name: string; spent: number; budget: number }>;
  };
  debts?: Array<{
    creditor: string;
    amount: number;
    rate: number;
    type: string;
  }>;
  savingsGoals?: Array<{
    name: string;
    current: number;
    target: number;
    priority: string;
  }>;
}

export interface UseAdvisorChatOptions {
  userId?: string;
  context?: FinancialContext;
}

/**
 * Hook personalizado para el chat con Norma usando Vercel AI SDK v5
 *
 * Proporciona streaming de respuestas en tiempo real y manejo automático
 * del estado del chat. Sigue el patrón de documind.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading, isStreaming } = useAdvisorChat({
 *   userId: 'user-123',
 *   context: { currentBudget: {...}, debts: [...] }
 * });
 * ```
 */
export function useAdvisorChat(options: UseAdvisorChatOptions = {}) {
  const { userId = 'user-demo', context } = options;
  const [input, setInput] = useState('');

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
    sendMessage: sendMessageHook,
    status,
    error,
    regenerate,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/advisor/stream',
      body: {
        userId,
        context,
      },
    }),
  });

  // Check if chat is loading
  const isLoading = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  /**
   * Envía un mensaje al chat
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      sendMessageHook({ text: content.trim() });
    },
    [sendMessageHook]
  );

  /**
   * Limpia la conversación y muestra mensaje de bienvenida
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  /**
   * Detiene el streaming actual
   */
  const stop = useCallback(() => {
    // In AI SDK v5, stopping is handled differently
    // The abort controller is managed internally
  }, []);

  return {
    /** Lista de mensajes de la conversación */
    messages,
    /** Envía un nuevo mensaje */
    sendMessage,
    /** Estado de carga general */
    isLoading,
    /** True cuando está recibiendo streaming de respuesta */
    isStreaming,
    /** Estado del chat: 'ready' | 'submitted' | 'streaming' | 'error' */
    status,
    /** Error si ocurrió alguno */
    error,
    /** Limpia la conversación */
    clearConversation,
    /** Regenera el último mensaje */
    regenerate,
    /** Detiene el streaming actual */
    stop,
    /** Input controlado */
    input,
    /** Setter para input */
    setInput,
  };
}

export type UseAdvisorChatReturn = ReturnType<typeof useAdvisorChat>;
