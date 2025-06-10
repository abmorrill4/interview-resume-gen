
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseVoiceChatReturn {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearMessages: () => void;
}

export const useVoiceChat = (): UseVoiceChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('voice-chat', {
        body: { 
          message, 
          conversationHistory: messages.slice(-10) // Keep last 10 messages for context
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
      console.error('Error in voice chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sendMessage, isLoading, error, clearMessages };
};
