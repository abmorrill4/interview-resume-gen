
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTextToSpeechReturn {
  speak: (text: string, voice?: string) => Promise<void>;
  isPlaying: boolean;
  stop: () => void;
  error: string | null;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voice: string = 'alloy') => {
    if (!text.trim()) return;

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setIsPlaying(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Create audio from base64
      const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMessage);
      setIsPlaying(false);
      console.error('Error in text-to-speech:', err);
    }
  }, [currentAudio]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  return { speak, isPlaying, stop, error };
};
