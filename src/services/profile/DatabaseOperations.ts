
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export class DatabaseOperations {
  static async addNewExperience(userId: string, experience: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('experiences')
        .insert({
          user_id: userId,
          job_title: experience.job_title,
          company_name: experience.company_name,
          start_date: experience.start_date || new Date().toISOString().split('T')[0],
          end_date: experience.end_date || null,
          description: experience.description || null
        });

      if (error) {
        console.error('Error adding experience:', error);
        toast.error(`Failed to add experience: ${experience.job_title}`);
        return false;
      }

      console.log('Successfully added new experience:', experience.job_title, 'at', experience.company_name);
      return true;
    } catch (error) {
      console.error('Error adding experience:', error);
      toast.error(`Failed to add experience: ${experience.job_title}`);
      return false;
    }
  }

  static async addNewSkill(userId: string, skill: any): Promise<boolean> {
    try {
      // First, check if skill exists in skills table, if not create it
      let { data: skillData, error: skillSelectError } = await supabase
        .from('skills')
        .select('id')
        .ilike('name', skill.name)
        .limit(1);

      if (skillSelectError) {
        console.error('Error checking skill:', skillSelectError);
        toast.error(`Failed to add skill: ${skill.name}`);
        return false;
      }

      let skillId;
      if (!skillData?.length) {
        // Create new skill
        const { data: newSkill, error: skillInsertError } = await supabase
          .from('skills')
          .insert({
            name: skill.name,
            type: skill.type || 'Technical',
            description: null
          })
          .select('id')
          .single();

        if (skillInsertError) {
          console.error('Error creating skill:', skillInsertError);
          toast.error(`Failed to add skill: ${skill.name}`);
          return false;
        }
        skillId = newSkill.id;
      } else {
        skillId = skillData[0].id;
      }

      // Add to user_skills
      const { error: userSkillError } = await supabase
        .from('user_skills')
        .insert({
          user_id: userId,
          skill_id: skillId,
          proficiency_level: skill.proficiency_level || 'Intermediate',
          years_of_experience: skill.years_of_experience || null
        });

      if (userSkillError) {
        console.error('Error adding user skill:', userSkillError);
        toast.error(`Failed to add skill: ${skill.name}`);
        return false;
      }

      console.log('Successfully added new skill:', skill.name);
      return true;
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(`Failed to add skill: ${skill.name}`);
      return false;
    }
  }

  static async addNewEducation(userId: string, edu: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('education')
        .insert({
          user_id: userId,
          degree_name: edu.degree_name,
          institution_name: edu.institution_name,
          field_of_study: edu.field_of_study,
          completion_date: edu.completion_date || null
        });

      if (!error) {
        console.log('Successfully added new education:', edu.degree_name);
        return true;
      } else {
        console.error('Error adding education:', error);
        toast.error(`Failed to add education: ${edu.degree_name}`);
        return false;
      }
    } catch (error) {
      console.error('Error adding education:', error);
      toast.error(`Failed to add education: ${edu.degree_name}`);
      return false;
    }
  }

  static async addNewProject(userId: string, project: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          project_name: project.project_name,
          description: project.description || null,
          start_date: project.start_date || null,
          end_date: project.end_date || null
        });

      if (!error) {
        console.log('Successfully added new project:', project.project_name);
        return true;
      } else {
        console.error('Error adding project:', error);
        toast.error(`Failed to add project: ${project.project_name}`);
        return false;
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error(`Failed to add project: ${project.project_name}`);
      return false;
    }
  }

  static async addNewAchievement(userId: string, achievement: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          description: achievement.description,
          date_achieved: achievement.date_achieved || null,
          metric_value: achievement.metric_value || null,
          metric_unit: achievement.metric_unit || null
        });

      if (!error) {
        console.log('Successfully added new achievement:', achievement.description);
        return true;
      } else {
        console.error('Error adding achievement:', error);
        toast.error(`Failed to add achievement`);
        return false;
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast.error(`Failed to add achievement`);
      return false;
    }
  }
}
