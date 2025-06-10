
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type, context } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    switch (type) {
      case 'workExperience':
        systemPrompt = `You are an expert resume writer. Enhance the following work experience description by making it more professional, impactful, and quantifiable. Focus on achievements and results. Keep it concise but compelling. Format as bullet points starting with action verbs.`;
        break;
      case 'skills':
        systemPrompt = `You are an expert resume writer. Organize and enhance the following skills list. Group related skills together, use industry-standard terminology, and ensure relevance to the person's field. Return as a comma-separated list.`;
        break;
      case 'achievements':
        systemPrompt = `You are an expert resume writer. Enhance the following achievements by making them more specific, quantifiable, and impactful. Focus on measurable results and recognition. Format as clear, concise bullet points.`;
        break;
      case 'education':
        systemPrompt = `You are an expert resume writer. Enhance the following education information by making it more professional and highlighting relevant coursework, honors, or achievements where appropriate.`;
        break;
      default:
        systemPrompt = `You are an expert resume writer. Enhance the following content to be more professional, clear, and impactful for a resume.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original content: ${content}\n\nAdditional context: ${context || 'No additional context provided.'}` }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to enhance content');
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    console.log('Content enhanced successfully');

    return new Response(JSON.stringify({ enhancedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
