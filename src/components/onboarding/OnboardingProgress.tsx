
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Trophy, 
  Star, 
  Gift,
  Zap,
  Award
} from 'lucide-react';

export const OnboardingProgress: React.FC = () => {
  const { 
    steps, 
    progress, 
    isOnboardingActive, 
    setActiveTutorial, 
    completedRewards,
    skipOnboarding
  } = useOnboarding();

  if (!isOnboardingActive) return null;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award className="h-4 w-4" />;
      case 'points': return <Star className="h-4 w-4" />;
      case 'feature': return <Zap className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Getting Started Journey</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete these interactive tutorials to master CareerOS
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={skipOnboarding}>
            Skip for now
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              step.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-background border-border hover:bg-muted/50'
            }`}
          >
            <div className={`flex-shrink-0 ${
              step.completed ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${
                step.completed ? 'text-green-800' : 'text-foreground'
              }`}>
                {step.title}
              </h3>
              <p className={`text-sm ${
                step.completed ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {step.description}
              </p>
              
              {step.reward && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={completedRewards.includes(step.reward.value) ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {getRewardIcon(step.reward.type)}
                    <span className="ml-1">{step.reward.description}</span>
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {step.completed ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Completed
                </Badge>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => step.tutorial && setActiveTutorial(step.tutorial)}
                  disabled={!step.tutorial}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Tutorial
                </Button>
              )}
            </div>
          </div>
        ))}

        {progress === 100 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center">
            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Congratulations! Onboarding Complete!
            </h3>
            <p className="text-sm text-green-600 mb-4">
              You've mastered the basics of CareerOS. You're now ready to accelerate your career journey!
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-green-600">
                <Trophy className="h-3 w-3 mr-1" />
                Master Badge Earned
              </Badge>
              <Badge className="bg-blue-600">
                <Star className="h-3 w-3 mr-1" />
                500 Career Points
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
