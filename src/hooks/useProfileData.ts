import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Experience {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

interface Skill {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface UserSkill {
  skill_id: string;
  user_id: string;
  proficiency_level?: string;
  years_of_experience?: number;
  skill: Skill;
}

interface Education {
  id: string;
  user_id: string;
  degree_name: string;
  institution_name: string;
  field_of_study: string;
  completion_date?: string;
}

interface Project {
  id: string;
  user_id: string;
  project_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  experience_id?: string;
}

interface Achievement {
  id: string;
  user_id: string;
  description: string;
  date_achieved?: string;
  metric_value?: number;
  metric_unit?: string;
  experience_id?: string;
  project_id?: string;
}

interface ProfileStats {
  experienceCount: number;
  skillsCount: number;
  educationCount: number;
  projectsCount: number;
  achievementsCount: number;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  // Fetch profile statistics
  const fetchProfileStats = useCallback(async () => {
    if (!user) return;

    try {
      const [expResult, skillsResult, eduResult, projResult, achResult] = await Promise.all([
        supabase.from('experiences').select('id').eq('user_id', user.id),
        supabase.from('user_skills').select('skill_id').eq('user_id', user.id),
        supabase.from('education').select('id').eq('user_id', user.id),
        supabase.from('projects').select('id').eq('user_id', user.id),
        supabase.from('achievements').select('id').eq('user_id', user.id)
      ]);

      setProfileStats({
        experienceCount: expResult.data?.length || 0,
        skillsCount: skillsResult.data?.length || 0,
        educationCount: eduResult.data?.length || 0,
        projectsCount: projResult.data?.length || 0,
        achievementsCount: achResult.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  }, [user]);

  // Experience methods
  const fetchExperiences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Error",
        description: "Failed to load experiences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addExperience = useCallback(async (experience: Omit<Experience, 'id' | 'user_id'>) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('experiences')
        .insert({ ...experience, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setExperiences(prev => [data, ...prev]);
      await fetchProfileStats();
      
      toast({
        title: "Success",
        description: "Experience added successfully"
      });

      return data;
    } catch (error) {
      console.error('Error adding experience:', error);
      toast({
        title: "Error",
        description: "Failed to add experience",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  const updateExperience = useCallback(async (id: string, updates: Partial<Experience>) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setExperiences(prev => prev.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      ));

      toast({
        title: "Success",
        description: "Experience updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: "Error",
        description: "Failed to update experience",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteExperience = useCallback(async (id: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setExperiences(prev => prev.filter(exp => exp.id !== id));
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Experience deleted successfully"
      });

      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  // Skills methods
  const fetchUserSkills = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserSkills(data || []);
    } catch (error) {
      console.error('Error fetching user skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addUserSkill = useCallback(async (skillData: {
    skillId: string;
    proficiencyLevel?: string;
    yearsOfExperience?: number;
  }) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_skills')
        .insert({
          user_id: user.id,
          skill_id: skillData.skillId,
          proficiency_level: skillData.proficiencyLevel,
          years_of_experience: skillData.yearsOfExperience
        });

      if (error) throw error;

      await fetchUserSkills();
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Skill added successfully"
      });

      return true;
    } catch (error) {
      console.error('Error adding user skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchUserSkills, fetchProfileStats]);

  // Education methods
  const fetchEducation = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: "Error",
        description: "Failed to load education",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addEducation = useCallback(async (education: Omit<Education, 'id' | 'user_id'>) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('education')
        .insert({ ...education, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setEducation(prev => [data, ...prev]);
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Education added successfully"
      });

      return data;
    } catch (error) {
      console.error('Error adding education:', error);
      toast({
        title: "Error",
        description: "Failed to add education",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  const updateEducation = useCallback(async (id: string, updates: Partial<Education>) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('education')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEducation(prev => prev.map(edu => 
        edu.id === id ? { ...edu, ...updates } : edu
      ));

      toast({
        title: "Success",
        description: "Education updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Error updating education:', error);
      toast({
        title: "Error",
        description: "Failed to update education",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteEducation = useCallback(async (id: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEducation(prev => prev.filter(edu => edu.id !== id));
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Education deleted successfully"
      });

      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  const deleteUserSkill = useCallback(async (skillId: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('skill_id', skillId)
        .eq('user_id', user.id);

      if (error) throw error;

      setUserSkills(prev => prev.filter(us => us.skill_id !== skillId));
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Skill removed successfully"
      });

      return true;
    } catch (error) {
      console.error('Error removing skill:', error);
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  // Projects methods
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'user_id'>) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data, ...prev]);
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Project added successfully"
      });

      return data;
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  // Achievements methods
  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('date_achieved', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addAchievement = useCallback(async (achievement: Omit<Achievement, 'id' | 'user_id'>) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert({ ...achievement, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setAchievements(prev => [data, ...prev]);
      await fetchProfileStats();

      toast({
        title: "Success",
        description: "Achievement added successfully"
      });

      return data;
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast({
        title: "Error",
        description: "Failed to add achievement",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchProfileStats]);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      fetchProfileStats();
    }
  }, [user, fetchProfileStats]);

  return {
    loading,
    profileStats,
    experiences,
    userSkills,
    education,
    projects,
    achievements,
    fetchExperiences,
    addExperience,
    updateExperience,
    deleteExperience,
    fetchUserSkills,
    addUserSkill,
    fetchEducation,
    addEducation,
    updateEducation,
    deleteEducation,
    deleteUserSkill,
    fetchProjects,
    addProject,
    fetchAchievements,
    addAchievement,
    fetchProfileStats
  };
};
