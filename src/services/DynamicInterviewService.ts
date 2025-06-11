import { DynamicQuestion, InterviewResponse, UserProfile } from '@/types/InterviewTypes';

export class DynamicInterviewService {
  private static getBaseQuestions(): DynamicQuestion[] {
    return [
      {
        id: 'career_stage',
        type: 'multiple_choice',
        text: 'What best describes your current career stage?',
        category: 'personal_info',
        required: true,
        options: [
          { value: 'student', label: 'Student or Recent Graduate' },
          { value: 'entry_level', label: 'Entry Level (0-2 years experience)' },
          { value: 'mid_level', label: 'Mid-Level (3-7 years experience)' },
          { value: 'senior_level', label: 'Senior Level (8+ years experience)' },
          { value: 'career_change', label: 'Career Changer' }
        ]
      },
      {
        id: 'primary_goal',
        type: 'multiple_choice',
        text: 'What\'s your primary goal for using this platform?',
        category: 'goals',
        required: true,
        options: [
          { value: 'job_search', label: 'Job Search', followUp: ['job_search_timeline', 'target_companies'] },
          { value: 'career_growth', label: 'Career Advancement', followUp: ['promotion_timeline', 'skill_gaps'] },
          { value: 'skill_development', label: 'Skill Development', followUp: ['learning_preferences', 'target_skills'] },
          { value: 'networking', label: 'Professional Networking', followUp: ['networking_goals'] },
          { value: 'portfolio', label: 'Portfolio Building', followUp: ['portfolio_focus'] }
        ]
      },
      {
        id: 'job_search_timeline',
        type: 'multiple_choice',
        text: 'When are you looking to start a new role?',
        category: 'job_search',
        required: true,
        condition: {
          questionId: 'primary_goal',
          operator: 'equals',
          value: 'job_search'
        },
        options: [
          { value: 'immediately', label: 'Immediately' },
          { value: 'within_month', label: 'Within 1 month' },
          { value: 'within_3_months', label: 'Within 3 months' },
          { value: 'within_6_months', label: 'Within 6 months' },
          { value: 'exploring', label: 'Just exploring options' }
        ]
      },
      {
        id: 'target_companies',
        type: 'textarea',
        text: 'What types of companies or specific organizations are you targeting?',
        category: 'job_search',
        required: false,
        condition: {
          questionId: 'primary_goal',
          operator: 'equals',
          value: 'job_search'
        }
      },
      {
        id: 'work_satisfaction',
        type: 'rating',
        text: 'How satisfied are you with your current work situation?',
        category: 'satisfaction',
        required: true,
        condition: {
          questionId: 'career_stage',
          operator: 'not_equals',
          value: 'student'
        },
        scale: {
          min: 1,
          max: 10,
          labels: {
            min: 'Very Dissatisfied',
            max: 'Very Satisfied'
          }
        }
      },
      {
        id: 'skill_confidence',
        type: 'rating',
        text: 'How confident are you in your current skill set?',
        category: 'skills',
        required: true,
        scale: {
          min: 1,
          max: 10,
          labels: {
            min: 'Need Major Development',
            max: 'Highly Confident'
          }
        }
      },
      {
        id: 'learning_preferences',
        type: 'multiple_choice',
        text: 'How do you prefer to learn new skills?',
        category: 'learning',
        required: false,
        allowMultiple: true,
        condition: {
          questionId: 'primary_goal',
          operator: 'equals',
          value: 'skill_development'
        },
        options: [
          { value: 'online_courses', label: 'Online Courses' },
          { value: 'hands_on', label: 'Hands-on Projects' },
          { value: 'mentorship', label: 'Mentorship' },
          { value: 'workshops', label: 'Workshops/Bootcamps' },
          { value: 'self_study', label: 'Self-Study' },
          { value: 'on_job', label: 'On-the-job Training' }
        ]
      },
      {
        id: 'work_experience_details',
        type: 'textarea',
        text: 'Tell me about your most significant work experience and achievements.',
        category: 'experience',
        required: true,
        condition: {
          questionId: 'career_stage',
          operator: 'not_equals',
          value: 'student'
        }
      },
      {
        id: 'education_background',
        type: 'textarea',
        text: 'What\'s your educational background? Include degrees, certifications, and relevant coursework.',
        category: 'education',
        required: true
      },
      {
        id: 'key_skills',
        type: 'textarea',
        text: 'What are your key technical and soft skills? Please be specific.',
        category: 'skills',
        required: true
      },
      {
        id: 'career_aspirations',
        type: 'textarea',
        text: 'Where do you see yourself in the next 2-3 years? What are your career aspirations?',
        category: 'goals',
        required: true
      }
    ];
  }

  static getPersonalizedQuestions(userProfile: UserProfile): DynamicQuestion[] {
    const baseQuestions = this.getBaseQuestions();
    
    // Add personalized questions based on user profile
    const personalizedQuestions: DynamicQuestion[] = [];

    if (userProfile.hasWorkExperience && userProfile.experienceYears > 5) {
      personalizedQuestions.push({
        id: 'leadership_experience',
        type: 'multiple_choice',
        text: 'Given your experience, have you had any leadership or management roles?',
        category: 'leadership',
        required: false,
        options: [
          { value: 'direct_reports', label: 'Yes, I manage direct reports' },
          { value: 'project_lead', label: 'Yes, I lead projects/teams' },
          { value: 'informal_leader', label: 'Informal leadership roles' },
          { value: 'aspiring', label: 'No, but I\'m interested in leadership' },
          { value: 'not_interested', label: 'No, I prefer individual contributor roles' }
        ]
      });
    }

    if (userProfile.skillsCount < 3) {
      personalizedQuestions.push({
        id: 'skill_development_priority',
        type: 'rating',
        text: 'How important is developing new technical skills to you right now?',
        category: 'skills',
        required: false,
        scale: {
          min: 1,
          max: 10,
          labels: {
            min: 'Not Important',
            max: 'Critical Priority'
          }
        }
      });
    }

    if (userProfile.careerGoals) {
      personalizedQuestions.push({
        id: 'goal_progress',
        type: 'rating',
        text: 'How would you rate your current progress toward your career goals?',
        category: 'goals',
        required: false,
        scale: {
          min: 1,
          max: 10,
          labels: {
            min: 'Just Getting Started',
            max: 'Nearly There'
          }
        }
      });
    }

    return [...baseQuestions, ...personalizedQuestions];
  }

  static getNextQuestion(
    questions: DynamicQuestion[],
    responses: InterviewResponse[]
  ): DynamicQuestion | null {
    const answeredIds = new Set(responses.map(r => r.questionId));
    
    for (const question of questions) {
      // Skip if already answered
      if (answeredIds.has(question.id)) continue;
      
      // Check condition if it exists
      if (question.condition) {
        const conditionResponse = responses.find(r => r.questionId === question.condition!.questionId);
        if (!conditionResponse || !this.evaluateCondition(question.condition, conditionResponse.value)) {
          continue;
        }
      }
      
      return question;
    }
    
    return null; // No more questions
  }

  static getFollowUpQuestions(
    responses: InterviewResponse[],
    allQuestions: DynamicQuestion[]
  ): string[] {
    const followUpIds: string[] = [];
    
    responses.forEach(response => {
      const question = allQuestions.find(q => q.id === response.questionId);
      if (question?.type === 'multiple_choice') {
        const selectedOption = question.options.find(opt => opt.value === response.value);
        if (selectedOption?.followUp) {
          followUpIds.push(...selectedOption.followUp);
        }
      }
    });
    
    return followUpIds;
  }

  static evaluateCondition(
    condition: { questionId: string; operator: string; value: any },
    responseValue: any
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return responseValue === condition.value;
      case 'not_equals':
        return responseValue !== condition.value;
      case 'contains':
        return Array.isArray(responseValue) 
          ? responseValue.includes(condition.value)
          : String(responseValue).includes(String(condition.value));
      case 'greater_than':
        return Number(responseValue) > Number(condition.value);
      case 'less_than':
        return Number(responseValue) < Number(condition.value);
      default:
        return true;
    }
  }

  static calculateProgress(
    totalQuestions: number,
    answeredQuestions: number
  ): number {
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }
}
