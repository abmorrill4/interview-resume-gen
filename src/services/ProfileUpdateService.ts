import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface ExtractedProfileData {
  experiences?: Array<{
    job_title: string;
    company_name: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  skills?: Array<{
    name: string;
    type: string;
    proficiency_level?: string;
    years_of_experience?: number;
  }>;
  education?: Array<{
    degree_name: string;
    institution_name: string;
    field_of_study: string;
    completion_date?: string;
  }>;
  projects?: Array<{
    project_name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }>;
  achievements?: Array<{
    description: string;
    date_achieved?: string;
    metric_value?: number;
    metric_unit?: string;
  }>;
}

export class ProfileUpdateService {
  private static async extractDataFromTranscript(transcript: string): Promise<ExtractedProfileData> {
    const loadingToast = toast.loading('Analyzing your response for profile updates...', {
      duration: 10000
    });

    try {
      console.log('Extracting profile data from transcript...');
      
      const { data, error } = await supabase.functions.invoke('enhance-content', {
        body: {
          prompt: `Extract structured profile information from this interview transcript. Focus on NEW information not already mentioned in previous messages.

Extract:
1. Work Experience (job titles, companies, dates, responsibilities)
2. Skills (technical and soft skills with proficiency if mentioned)
3. Education (degrees, institutions, fields of study, graduation dates)
4. Projects (names, descriptions, timeframes)
5. Achievements (accomplishments with metrics if available)

Transcript: ${transcript}

Respond ONLY with valid JSON in this exact format:
{
  "experiences": [{"job_title": "", "company_name": "", "start_date": "", "end_date": "", "description": ""}],
  "skills": [{"name": "", "type": "Technical|Soft", "proficiency_level": "Beginner|Intermediate|Advanced|Expert", "years_of_experience": 0}],
  "education": [{"degree_name": "", "institution_name": "", "field_of_study": "", "completion_date": ""}],
  "projects": [{"project_name": "", "description": "", "start_date": "", "end_date": ""}],
  "achievements": [{"description": "", "date_achieved": "", "metric_value": 0, "metric_unit": ""}]
}`
        }
      });

      toast.dismiss(loadingToast);

      if (error) {
        console.error('Error calling enhance-content function:', error);
        toast.error('Failed to analyze your response. Please try again.');
        return {};
      }

      if (!data?.enhancedContent) {
        console.warn('No enhanced content received');
        return {};
      }

      try {
        const parsed = JSON.parse(data.enhancedContent);
        console.log('Successfully extracted profile data:', parsed);
        return parsed;
      } catch (parseError) {
        console.error('Failed to parse enhanced content as JSON:', parseError);
        toast.error('Failed to process your response. Please try again.');
        return {};
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error extracting profile data:', error);
      toast.error('An error occurred while analyzing your response.');
      return {};
    }
  }

  private static async checkExistingExperience(userId: string, jobTitle: string, companyName: string): Promise<boolean> {
    const { data } = await supabase
      .from('experiences')
      .select('id')
      .eq('user_id', userId)
      .ilike('job_title', `%${jobTitle}%`)
      .ilike('company_name', `%${companyName}%`)
      .limit(1);
    
    return (data?.length || 0) > 0;
  }

  private static async checkExistingSkill(userId: string, skillName: string): Promise<boolean> {
    const { data: skillData } = await supabase
      .from('skills')
      .select('id')
      .ilike('name', `%${skillName}%`)
      .limit(1);

    if (!skillData?.length) return false;

    const { data: userSkillData } = await supabase
      .from('user_skills')
      .select('skill_id')
      .eq('user_id', userId)
      .eq('skill_id', skillData[0].id)
      .limit(1);

    return (userSkillData?.length || 0) > 0;
  }

  private static async addNewExperience(userId: string, experience: any): Promise<boolean> {
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

  private static async addNewSkill(userId: string, skill: any): Promise<boolean> {
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

  static async processInterviewMessage(userId: string, message: string): Promise<{
    updated: boolean;
    addedItems: {
      experiences: number;
      skills: number;
      education: number;
      projects: number;
      achievements: number;
    };
  }> {
    if (!userId || !message?.trim()) {
      return {
        updated: false,
        addedItems: {
          experiences: 0,
          skills: 0,
          education: 0,
          projects: 0,
          achievements: 0
        }
      };
    }

    const updateToast = toast.loading('Updating your profile...', {
      duration: 15000
    });

    try {
      const extractedData = await this.extractDataFromTranscript(message);
      const addedItems = {
        experiences: 0,
        skills: 0,
        education: 0,
        projects: 0,
        achievements: 0
      };

      // Process experiences
      if (extractedData.experiences?.length) {
        for (const experience of extractedData.experiences) {
          if (experience.job_title && experience.company_name) {
            const exists = await this.checkExistingExperience(userId, experience.job_title, experience.company_name);
            if (!exists) {
              const added = await this.addNewExperience(userId, experience);
              if (added) addedItems.experiences++;
            }
          }
        }
      }

      // Process skills
      if (extractedData.skills?.length) {
        for (const skill of extractedData.skills) {
          if (skill.name) {
            const exists = await this.checkExistingSkill(userId, skill.name);
            if (!exists) {
              const added = await this.addNewSkill(userId, skill);
              if (added) addedItems.skills++;
            }
          }
        }
      }

      // Process education
      if (extractedData.education?.length) {
        for (const edu of extractedData.education) {
          if (edu.degree_name && edu.institution_name && edu.field_of_study) {
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
                addedItems.education++;
                console.log('Successfully added new education:', edu.degree_name);
              } else {
                console.error('Error adding education:', error);
                toast.error(`Failed to add education: ${edu.degree_name}`);
              }
            } catch (error) {
              console.error('Error adding education:', error);
              toast.error(`Failed to add education: ${edu.degree_name}`);
            }
          }
        }
      }

      // Process projects
      if (extractedData.projects?.length) {
        for (const project of extractedData.projects) {
          if (project.project_name) {
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
                addedItems.projects++;
                console.log('Successfully added new project:', project.project_name);
              } else {
                console.error('Error adding project:', error);
                toast.error(`Failed to add project: ${project.project_name}`);
              }
            } catch (error) {
              console.error('Error adding project:', error);
              toast.error(`Failed to add project: ${project.project_name}`);
            }
          }
        }
      }

      // Process achievements
      if (extractedData.achievements?.length) {
        for (const achievement of extractedData.achievements) {
          if (achievement.description) {
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
                addedItems.achievements++;
                console.log('Successfully added new achievement:', achievement.description);
              } else {
                console.error('Error adding achievement:', error);
                toast.error(`Failed to add achievement`);
              }
            } catch (error) {
              console.error('Error adding achievement:', error);
              toast.error(`Failed to add achievement`);
            }
          }
        }
      }

      const totalAdded = Object.values(addedItems).reduce((sum, count) => sum + count, 0);
      
      toast.dismiss(updateToast);

      if (totalAdded > 0) {
        // Show success message with details
        const updateSummary = [];
        if (addedItems.experiences > 0) updateSummary.push(`${addedItems.experiences} experience(s)`);
        if (addedItems.skills > 0) updateSummary.push(`${addedItems.skills} skill(s)`);
        if (addedItems.education > 0) updateSummary.push(`${addedItems.education} education(s)`);
        if (addedItems.projects > 0) updateSummary.push(`${addedItems.projects} project(s)`);
        if (addedItems.achievements > 0) updateSummary.push(`${addedItems.achievements} achievement(s)`);

        toast.success(`Profile updated! Added ${updateSummary.join(', ')}.`, {
          duration: 6000
        });
      }
      
      return {
        updated: totalAdded > 0,
        addedItems
      };

    } catch (error) {
      toast.dismiss(updateToast);
      console.error('Error processing interview message:', error);
      toast.error('Failed to update profile. Please try again.');
      
      return {
        updated: false,
        addedItems: {
          experiences: 0,
          skills: 0,
          education: 0,
          projects: 0,
          achievements: 0
        }
      };
    }
  }
}
