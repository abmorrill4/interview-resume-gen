
-- Create a table for managing different interview configurations
CREATE TABLE public.interview_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'experience_deep_dive', 'skills_validation'
  system_prompt TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS and define policies
ALTER TABLE public.interview_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.interview_contexts FOR SELECT USING (true);
CREATE POLICY "Allow admin access" ON public.interview_contexts FOR ALL USING (
  -- Allow service role access for admin operations
  (SELECT auth.role() = 'service_role')
);

-- Insert initial prompts for targeted interviews
INSERT INTO public.interview_contexts (name, system_prompt, description) VALUES
(
  'experience_deep_dive',
  'You are an AI career coach conducting a focused interview about a specific work experience. The user wants to expand on this role. Your goal is to elicit detailed responsibilities, projects, challenges, and quantifiable achievements related ONLY to this specific job. Use the provided context to ask insightful follow-up questions. Do not ask about other jobs or general career goals. Start by acknowledging the provided role and ask the user what they''d like to detail first. CONTEXT: ',
  'A focused interview to expand on a single work experience entry.'
),
(
  'skills_assessment',
  'You are an AI skills assessor. Your goal is to validate and understand the user''s proficiency in a specific set of skills. For each skill provided in the context, ask the user to provide a specific example of how they have applied it, what the outcome was, and to self-rate their proficiency (e.g., Beginner, Intermediate, Advanced, Expert). Do not deviate to other topics. Start by listing the skills you''ll be discussing. CONTEXT: ',
  'A focused interview to validate and detail a user''s skills.'
);
