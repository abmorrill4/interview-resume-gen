
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RealtimeInterviewOptions {
  contextType?: string;
  contextData?: any;
}

export const useRealtimeInterview = (options: RealtimeInterviewOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      
      // Set up audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      // Build WebSocket URL with context parameters
      let wsUrl = `wss://nmlxgczvrxkhurejqqod.supabase.co/functions/v1/realtime-interview`;
      
      if (options.contextType && options.contextData) {
        const params = new URLSearchParams({
          contextType: options.contextType,
          contextData: encodeURIComponent(JSON.stringify(options.contextData))
        });
        wsUrl += `?${params.toString()}`;
      }
      
      // Connect to WebSocket
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Connected to realtime interview');
        setIsConnected(true);
        setIsConnecting(false);
        
        toast({
          title: "Connected",
          description: "Voice interview is ready. You can start speaking.",
        });
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        switch (data.type) {
          case 'session.created':
            console.log('Session created');
            break;
            
          case 'response.audio.delta':
            setIsSpeaking(true);
            // Handle audio playback here if needed
            break;
            
          case 'response.audio.done':
            setIsSpeaking(false);
            break;
            
          case 'response.text.delta':
            // Update messages with streaming text
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + data.delta }
                ];
              } else {
                return [...prev, { role: 'assistant', content: data.delta, isStreaming: true }];
              }
            });
            break;
            
          case 'response.text.done':
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.isStreaming) {
                return [...prev.slice(0, -1), { ...lastMessage, isStreaming: false }];
              }
              return prev;
            });
            break;
            
          case 'input_audio_buffer.speech_started':
            setIsRecording(true);
            break;
            
          case 'input_audio_buffer.speech_stopped':
            setIsRecording(false);
            break;
            
          case 'error':
            console.error('Interview error:', data.error);
            toast({
              title: "Interview Error",
              description: data.error,
              variant: "destructive",
            });
            break;
        }
      };
      
      ws.onclose = () => {
        console.log('Disconnected from realtime interview');
        setIsConnected(false);
        setIsConnecting(false);
        setIsSpeaking(false);
        setIsRecording(false);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the interview service.",
          variant: "destructive",
        });
      };
      
      // Set up audio processing
      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          audioData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Calculate audio level for visual feedback
        const sum = inputData.reduce((acc, val) => acc + Math.abs(val), 0);
        setAudioLevel(sum / inputData.length);
        
        // Send audio data to server
        const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(audioData.buffer))));
        ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64Audio
        }));
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnecting(false);
      toast({
        title: "Microphone Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [isConnected, isConnecting, options.contextType, options.contextData, toast]);

  const disconnect = useCallback(() => {
    // Clean up WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Clean up audio resources
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "Please connect to the interview first.",
        variant: "destructive",
      });
      return;
    }

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    // Send text input to server
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    // Trigger response generation
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));
  }, [toast]);

  return {
    isConnected,
    isConnecting,
    messages,
    audioLevel,
    isRecording,
    isSpeaking,
    connect,
    disconnect,
    sendMessage
  };
};
