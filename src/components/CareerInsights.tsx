
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Lightbulb, ArrowRight, BarChart3 } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { useNavigate } from 'react-router-dom';

const CareerInsights: React.FC = () => {
  const { profileStats } = useProfileData();
  const navigate = useNavigate();

  const getSkillsInsight = () => {
    const skillCount = profileStats?.skillsCount || 0;
    if (skillCount === 0) return "No skills added yet - start with an interview to identify your strengths";
    if (skillCount < 5) return "Building your skill profile - consider adding more technical and soft skills";
    if (skillCount < 10) return "Good skill diversity - focus on developing expertise in key areas";
    return "Strong skill portfolio - consider specializing in emerging technologies";
  };

  const getExperienceInsight = () => {
    const expCount = profileStats?.experienceCount || 0;
    if (expCount === 0) return "Add your work experience to unlock career progression insights";
    if (expCount === 1) return "Great start! Add more roles to show your career journey";
    return "Strong experience profile - leverage this for senior opportunities";
  };

  const recommendations = [
    {
      type: "Skill Development",
      icon: TrendingUp,
      title: "Emerging Tech Skills",
      description: "AI/ML and cloud computing are in high demand",
      action: "Explore trending skills",
      color: "text-blue-600"
    },
    {
      type: "Career Growth",
      icon: Target,
      title: "Leadership Opportunities",
      description: "Consider roles with team management responsibilities",
      action: "View leadership paths",
      color: "text-green-600"
    },
    {
      type: "Industry Insights",
      icon: BarChart3,
      title: "Market Trends",
      description: "Remote work and flexible schedules are increasingly common",
      action: "See industry data",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Career Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-800 dark:text-blue-300">Skills Analysis</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">{getSkillsInsight()}</p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm text-green-800 dark:text-green-300">Experience Review</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400">{getExperienceInsight()}</p>
            </div>
          </div>

          {(!profileStats || 
            (profileStats.experienceCount === 0 && profileStats.skillsCount === 0)) && (
            <div className="text-center py-4">
              <Button 
                onClick={() => navigate('/interview')}
                className="w-full"
              >
                Start AI Interview for Personalized Insights
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <rec.icon className={`h-5 w-5 mt-0.5 ${rec.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{rec.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {rec.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                    {rec.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerInsights;
