
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Supabase configuration not found' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const url = new URL(req.url);
  const contextType = url.searchParams.get('contextType');
  const contextData = url.searchParams.get('contextData');

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWs: WebSocket | null = null;

  socket.onopen = async () => {
    console.log("Client connected to realtime interview");
    
    try {
      // Initialize Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      let systemPrompt = 'You are a helpful AI interviewer.';

      if (contextType && contextData) {
        // Fetch the specific context prompt
        const { data: contextPromptData, error: contextError } = await supabase
          .from('interview_contexts')
          .select('system_prompt')
          .eq('name', contextType)
          .single();

        if (contextError) {
          console.error('Error fetching context prompt:', contextError);
        } else if (contextPromptData) {
          const parsedContextData = JSON.parse(decodeURIComponent(contextData));
          let contextualInfo = '';
          
          if (contextType === 'experience_deep_dive') {
            contextualInfo = `Job Title: ${parsedContextData.job_title}, Company: ${parsedContextData.company_name}, Duration: ${parsedContextData.start_date} to ${parsedContextData.end_date || 'Present'}`;
            if (parsedContextData.description) {
              contextualInfo += `, Current Description: ${parsedContextData.description}`;
            }
          } else if (contextType === 'skills_assessment') {
            const skillNames = Array.isArray(parsedContextData) 
              ? parsedContextData.map((skill: any) => skill.name || skill).join(', ')
              : parsedContextData.name || parsedContextData;
            contextualInfo = `Skills to assess: ${skillNames}`;
          }

          systemPrompt = `${contextPromptData.system_prompt}${contextualInfo}`;
          console.log('Using contextual prompt for:', contextType);
        }
      } else {
        // Fetch the default AI interviewer system prompt
        const { data: promptData, error: promptError } = await supabase
          .from('system_prompts')
          .select('prompt')
          .eq('name', 'ai_interviewer')
          .single();

        if (promptError) {
          console.error('Error fetching system prompt:', promptError);
        } else if (promptData) {
          systemPrompt = promptData.prompt;
        }
      }

      console.log('Loaded system prompt from database');

      // Connect to OpenAI Realtime API
      const openaiUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`;
      console.log("Connecting to OpenAI:", openaiUrl);
      
      openaiWs = new WebSocket(openaiUrl, [
        "realtime", 
        `openai-insecure-api-key.${OPENAI_API_KEY}`,
        "openai-beta.realtime-v1"
      ]);

      openaiWs.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
        
        // Send session configuration with the dynamic system prompt
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ["text", "audio"],
            instructions: systemPrompt,
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
        console.log("Session configuration sent with dynamic prompt");
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

      openaiWs.onclose = (event) => {
        console.log("OpenAI WebSocket closed:", event.code, event.reason);
        socket.close();
      };
    } catch (error) {
      console.error("Failed to initialize interview:", error);
      socket.send(JSON.stringify({ type: 'error', error: 'Failed to initialize interview' }));
      socket.close();
    }
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
