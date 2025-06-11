
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Brain, Clock } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';

const InterviewProgress: React.FC = () => {
  const { profileStats } = useProfileData();

  const interviewSections = [
    {
      id: 'experience',
      label: 'Work Experience',
      completed: (profileStats?.experienceCount || 0) > 0,
      count: profileStats?.experienceCount || 0
    },
    {
      id: 'skills',
      label: 'Skills Assessment',
      completed: (profileStats?.skillsCount || 0) > 0,
      count: profileStats?.skillsCount || 0
    },
    {
      id: 'education',
      label: 'Education Background',
      completed: (profileStats?.educationCount || 0) > 0,
      count: profileStats?.educationCount || 0
    },
    {
      id: 'projects',
      label: 'Projects & Portfolio',
      completed: (profileStats?.projectsCount || 0) > 0,
      count: profileStats?.projectsCount || 0
    },
    {
      id: 'achievements',
      label: 'Achievements',
      completed: (profileStats?.achievementsCount || 0) > 0,
      count: profileStats?.achievementsCount || 0
    }
  ];

  const completedSections = interviewSections.filter(section => section.completed).length;
  const progressPercentage = (completedSections / interviewSections.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Interview Progress
          </CardTitle>
          <Badge variant={progressPercentage === 100 ? "default" : "outline"}>
            {completedSections}/{interviewSections.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="space-y-3">
            {interviewSections.map((section) => (
              <div key={section.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${section.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {section.label}
                  </span>
                </div>
                {section.completed && (
                  <Badge variant="secondary" className="text-xs">
                    {section.count} {section.count === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {progressPercentage < 100 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Next Steps</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Continue your AI interview to complete missing sections and unlock personalized insights.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewProgress;
