'use client';

import { useState } from 'react';

export function useAdvisor(userId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const sendMessage = async (message: string, context?: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message,
          conversationId,
          context,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        setConversationId(data.data.conversationId);
        setSuggestedQuestions(data.data.suggestedQuestions || []);
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error sending message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    setSuggestedQuestions([]);
  };

  return {
    messages,
    loading,
    error,
    suggestedQuestions,
    sendMessage,
    clearConversation,
  };
}

