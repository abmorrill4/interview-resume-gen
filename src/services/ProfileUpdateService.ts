
import { toast } from 'react-hot-toast';
import { DataExtractionService, ExtractedProfileData } from './profile/DataExtractionService';
import { ValidationService } from './profile/ValidationService';
import { DatabaseOperations } from './profile/DatabaseOperations';

export class ProfileUpdateService {
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
      const extractedData = await DataExtractionService.extractDataFromTranscript(message);
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
            const exists = await ValidationService.checkExistingExperience(userId, experience.job_title, experience.company_name);
            if (!exists) {
              const added = await DatabaseOperations.addNewExperience(userId, experience);
              if (added) addedItems.experiences++;
            }
          }
        }
      }

      // Process skills
      if (extractedData.skills?.length) {
        for (const skill of extractedData.skills) {
          if (skill.name) {
            const exists = await ValidationService.checkExistingSkill(userId, skill.name);
            if (!exists) {
              const added = await DatabaseOperations.addNewSkill(userId, skill);
              if (added) addedItems.skills++;
            }
          }
        }
      }

      // Process education
      if (extractedData.education?.length) {
        for (const edu of extractedData.education) {
          if (edu.degree_name && edu.institution_name && edu.field_of_study) {
            const added = await DatabaseOperations.addNewEducation(userId, edu);
            if (added) addedItems.education++;
          }
        }
      }

      // Process projects
      if (extractedData.projects?.length) {
        for (const project of extractedData.projects) {
          if (project.project_name) {
            const added = await DatabaseOperations.addNewProject(userId, project);
            if (added) addedItems.projects++;
          }
        }
      }

      // Process achievements
      if (extractedData.achievements?.length) {
        for (const achievement of extractedData.achievements) {
          if (achievement.description) {
            const added = await DatabaseOperations.addNewAchievement(userId, achievement);
            if (added) addedItems.achievements++;
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
