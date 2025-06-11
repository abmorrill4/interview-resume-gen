
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface ExtractedProfileData {
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

export class DataExtractionService {
  static async extractDataFromTranscript(transcript: string): Promise<ExtractedProfileData> {
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
}
