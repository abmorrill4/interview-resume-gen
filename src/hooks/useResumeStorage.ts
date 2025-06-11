import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGraphDatabase } from '@/hooks/useGraphDatabase';

interface UserData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
  };
  workExperience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    university: string;
    graduationYear: string;
  }>;
  skills: string[];
  achievements: string[];
}

interface Resume {
  id: string;
  title: string;
  personal_info: any;
  work_experience: any;
  education: any;
  skills: string[];
  achievements: string[];
  interview_transcript: any;
  created_at: string;
  updated_at: string;
}

export const useResumeStorage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createGraphFromResume } = useGraphDatabase();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);

  const saveResume = useCallback(async (userData: UserData, interviewTranscript?: any): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your resume.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: `Resume - ${new Date().toLocaleDateString()}`,
          personal_info: userData.personalInfo,
          work_experience: userData.workExperience,
          education: userData.education,
          skills: userData.skills,
          achievements: userData.achievements,
          interview_transcript: interviewTranscript
        })
        .select()
        .single();

      if (error) throw error;

      // Create graph data from resume
      await createGraphFromResume(userData);

      toast({
        title: "Resume saved!",
        description: "Your resume has been successfully saved and graph data created.",
      });

      return data.id;
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your resume. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, createGraphFromResume]);

  const loadResumes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast({
        title: "Loading failed",
        description: "There was an error loading your resumes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteResume = useCallback(async (resumeId: string) => {
    if (!user) return false;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      
      toast({
        title: "Resume deleted",
        description: "Your resume has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your resume.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    saveResume,
    loadResumes,
    deleteResume,
    resumes,
    loading
  };
};
