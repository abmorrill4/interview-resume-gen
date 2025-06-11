
import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData } from '@/utils/RealtimeAudio';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileUpdateService } from '@/services/ProfileUpdateService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseRealtimeInterviewReturn {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  messages: Message[];
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  profileUpdates: {
    totalUpdates: number;
    lastUpdate: {
      experiences: number;
      skills: number;
      education: number;
      projects: number;
      achievements: number;
    } | null;
  };
}

export const useRealtimeInterview = (): UseRealtimeInterviewReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profileUpdates, setProfileUpdates] = useState<{
    totalUpdates: number;
    lastUpdate: {
      experiences: number;
      skills: number;
      education: number;
      projects: number;
      achievements: number;
    } | null;
  }>({
    totalUpdates: 0,
    lastUpdate: null
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef<string>('');

  const processUserMessage = useCallback(async (content: string) => {
    if (!user?.id || !content?.trim()) return;

    try {
      console.log('Processing user message for profile updates:', content);
      
      const result = await ProfileUpdateService.processInterviewMessage(user.id, content);
      
      if (result.updated) {
        const totalNewItems = Object.values(result.addedItems).reduce((sum, count) => sum + count, 0);
        
        setProfileUpdates(prev => ({
          totalUpdates: prev.totalUpdates + totalNewItems,
          lastUpdate: result.addedItems
        }));

        // Show toast notification
        const updateSummary = [];
        if (result.addedItems.experiences > 0) updateSummary.push(`${result.addedItems.experiences} experience(s)`);
        if (result.addedItems.skills > 0) updateSummary.push(`${result.addedItems.skills} skill(s)`);
        if (result.addedItems.education > 0) updateSummary.push(`${result.addedItems.education} education(s)`);
        if (result.addedItems.projects > 0) updateSummary.push(`${result.addedItems.projects} project(s)`);
        if (result.addedItems.achievements > 0) updateSummary.push(`${result.addedItems.achievements} achievement(s)`);

        if (updateSummary.length > 0) {
          toast({
            title: "Profile Updated!",
            description: `Added ${updateSummary.join(', ')} to your profile hub.`,
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Error processing user message for profile updates:', error);
    }
  }, [user?.id, toast]);

  const handleAudioData = useCallback((audioData: Float32Array) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const encodedAudio = encodeAudioForAPI(audioData);
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: encodedAudio
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      console.log('Starting connection...');
      
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      console.log('Audio context created');
      
      // Get session to ensure authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
      console.log('User authenticated');

      // Connect to realtime interview edge function using the correct URL
      const wsUrl = `wss://nmlxgczvrxkhurejqqod.functions.supabase.co/functions/v1/realtime-interview`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Start audio recording
        try {
          audioRecorderRef.current = new AudioRecorder(handleAudioData);
          await audioRecorderRef.current.start();
          setIsListening(true);
          console.log('Audio recording started');
        } catch (audioError) {
          console.error('Failed to start audio recording:', audioError);
          setError('Microphone access denied. Please allow microphone permissions.');
        }
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        switch (data.type) {
          case 'session.created':
            console.log('Session created successfully');
            break;
            
          case 'session.updated':
            console.log('Session updated successfully');
            break;
            
          case 'input_audio_buffer.speech_started':
            console.log('User started speaking');
            break;
            
          case 'input_audio_buffer.speech_stopped':
            console.log('User stopped speaking');
            break;
            
          case 'response.audio.delta':
            if (data.delta && audioContextRef.current) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current, bytes);
              setIsSpeaking(true);
            }
            break;
            
          case 'response.audio.done':
            console.log('AI finished speaking');
            setIsSpeaking(false);
            break;
            
          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript) {
              const userMessage = {
                role: 'user' as const,
                content: data.transcript,
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, userMessage]);
              
              // Process the user message for profile updates
              await processUserMessage(data.transcript);
            }
            break;
            
          case 'response.audio_transcript.delta':
            if (data.delta) {
              currentTranscriptRef.current += data.delta;
            }
            break;
            
          case 'response.audio_transcript.done':
            if (currentTranscriptRef.current) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: currentTranscriptRef.current,
                timestamp: new Date()
              }]);
              currentTranscriptRef.current = '';
            }
            break;
            
          case 'error':
            console.error('WebSocket error:', data.error);
            // Fix: Extract the error message properly
            const errorMessage = typeof data.error === 'object' && data.error !== null 
              ? data.error.message || JSON.stringify(data.error)
              : String(data.error);
            setError(errorMessage);
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection failed. Please try again.');
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        
        if (event.code !== 1000) {
          setError('Connection lost unexpectedly');
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      console.error('Error connecting to realtime interview:', err);
      setError(errorMessage);
    }
  }, [handleAudioData, processUserMessage]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting...');
    
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isListening,
    isSpeaking,
    messages,
    connect,
    disconnect,
    error,
    profileUpdates
  };
};
