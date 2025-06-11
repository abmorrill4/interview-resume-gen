
import { supabase } from '@/integrations/supabase/client';

export class ValidationService {
  static async checkExistingExperience(userId: string, jobTitle: string, companyName: string): Promise<boolean> {
    const { data } = await supabase
      .from('experiences')
      .select('id')
      .eq('user_id', userId)
      .ilike('job_title', `%${jobTitle}%`)
      .ilike('company_name', `%${companyName}%`)
      .limit(1);
    
    return (data?.length || 0) > 0;
  }

  static async checkExistingSkill(userId: string, skillName: string): Promise<boolean> {
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
}
