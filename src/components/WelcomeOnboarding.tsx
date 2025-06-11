
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './onboarding/OnboardingProgress';
import { RewardsDisplay } from './onboarding/RewardsDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Rocket, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeOnboardingProps {
  hasDocuments: boolean;
  hasProfileData: boolean;
}

const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  hasDocuments,
  hasProfileData
}) => {
  const navigate = useNavigate();
  const { isOnboardingActive, progress, startOnboarding, completedRewards } = useOnboarding();

  // If user is not onboarding and has completed some steps, show success state
  if (!isOnboardingActive && (hasDocuments || hasProfileData || completedRewards.length > 0)) {
    return (
      <div className="space-y-6">
        {completedRewards.length > 0 && <RewardsDisplay />}
        
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Welcome Back!</CardTitle>
                <p className="text-muted-foreground">
                  Ready to continue your career journey?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{completedRewards.length} Achievements</span>
                </div>
                {progress > 0 && (
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-medium">{Math.round(progress)}% Complete</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={startOnboarding}>
                  Resume Tutorials
                </Button>
                <Button onClick={() => navigate('/interview')}>
                  Start Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show onboarding for new users
  if (isOnboardingActive) {
    return (
      <div className="space-y-6">
        <OnboardingProgress />
        {completedRewards.length > 0 && <RewardsDisplay />}
      </div>
    );
  }

  // First time visitor - encourage to start onboarding
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xl">Welcome to CareerOS!</CardTitle>
            <p className="text-muted-foreground">
              Let's get you started with a quick interactive tour
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Take our guided tutorials to learn how to make the most of your AI-powered career platform. 
            Complete challenges, earn rewards, and unlock advanced features!
          </p>
          <div className="flex gap-2">
            <Button onClick={startOnboarding} className="flex-1">
              <Brain className="h-4 w-4 mr-2" />
              Start Interactive Tour
            </Button>
            <Button variant="outline" onClick={() => navigate('/interview')}>
              Skip to Interview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeOnboarding;
