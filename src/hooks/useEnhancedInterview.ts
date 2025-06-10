
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseEnhancedInterviewReturn {
  enhanceContent: (content: string, type: string, context?: string) => Promise<string>;
  isEnhancing: boolean;
  error: string | null;
}

export const useEnhancedInterview = (): UseEnhancedInterviewReturn => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceContent = useCallback(async (content: string, type: string, context?: string): Promise<string> => {
    if (!content.trim()) return content;

    setIsEnhancing(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('enhance-content', {
        body: { content, type, context }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data.enhancedContent || content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance content';
      setError(errorMessage);
      console.error('Error enhancing content:', err);
      return content; // Return original content on error
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  return { enhanceContent, isEnhancing, error };
};
