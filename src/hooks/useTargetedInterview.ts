
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InterviewContext {
  id: string;
  name: string;
  system_prompt: string;
  description: string;
}

export const useTargetedInterview = () => {
  const [contexts, setContexts] = useState<InterviewContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContexts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('interview_contexts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContexts(data || []);
    } catch (err) {
      console.error('Error fetching interview contexts:', err);
      setError('Failed to load interview contexts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getContextByName = useCallback((name: string) => {
    return contexts.find(context => context.name === name);
  }, [contexts]);

  const buildContextualPrompt = useCallback((contextName: string, contextData: any) => {
    const context = getContextByName(contextName);
    if (!context) return null;

    let contextualInfo = '';
    
    if (contextName === 'experience_deep_dive' && contextData) {
      contextualInfo = `Job Title: ${contextData.job_title}, Company: ${contextData.company_name}, Duration: ${contextData.start_date} to ${contextData.end_date || 'Present'}`;
      if (contextData.description) {
        contextualInfo += `, Current Description: ${contextData.description}`;
      }
    } else if (contextName === 'skills_assessment' && contextData) {
      const skillNames = Array.isArray(contextData) 
        ? contextData.map((skill: any) => skill.name || skill).join(', ')
        : contextData.name || contextData;
      contextualInfo = `Skills to assess: ${skillNames}`;
    }

    return `${context.system_prompt}${contextualInfo}`;
  }, [getContextByName]);

  return {
    contexts,
    loading,
    error,
    fetchContexts,
    getContextByName,
    buildContextualPrompt
  };
};
