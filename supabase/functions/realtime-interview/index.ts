
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWs: WebSocket | null = null;

  socket.onopen = () => {
    console.log("Client connected to realtime interview");
    
    // Connect to OpenAI Realtime API
    openaiWs = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    openaiWs.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
      
      // Send session configuration after connection
      const sessionConfig = {
        type: 'session.update',
        session: {
          modalities: ["text", "audio"],
          instructions: `You are an expert career counselor conducting a friendly, conversational resume interview. Your goal is to help the user create an outstanding resume by gathering information about their:

1. Personal information (name, email, phone, LinkedIn)
2. Work experience (job titles, companies, dates, responsibilities, achievements)
3. Education (degrees, schools, graduation dates)
4. Skills (technical and soft skills)
5. Notable achievements and accomplishments

Guidelines:
- Be conversational and encouraging
- Ask follow-up questions to get specific details
- Help them quantify their achievements with numbers when possible
- Ask about impact and results of their work
- Keep the tone professional but friendly
- Don't rush - let them share their story naturally
- When you have enough information, let them know the interview is complete

Start by introducing yourself and asking them to tell you about themselves and their career goals.`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tools: [],
          tool_choice: "auto",
          temperature: 0.8,
          max_response_output_tokens: "inf"
        }
      };
      
      openaiWs?.send(JSON.stringify(sessionConfig));
    };

    openaiWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("OpenAI message:", data.type);
      
      // Forward all OpenAI messages to client
      socket.send(JSON.stringify(data));
    };

    openaiWs.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      socket.send(JSON.stringify({ type: 'error', error: 'Connection to AI failed' }));
    };

    openaiWs.onclose = () => {
      console.log("OpenAI WebSocket closed");
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    console.log("Client message received");
    
    // Forward client messages to OpenAI
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (openaiWs) {
      openaiWs.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    if (openaiWs) {
      openaiWs.close();
    }
  };

  return response;
});
