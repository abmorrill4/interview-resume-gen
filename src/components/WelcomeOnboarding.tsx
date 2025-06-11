
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Brain, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  completed: boolean;
}

interface WelcomeOnboardingProps {
  hasDocuments: boolean;
  hasProfileData: boolean;
}

const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  hasDocuments,
  hasProfileData
}) => {
  const navigate = useNavigate();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'upload',
      title: 'Upload your first document',
      description: 'Upload your Resume, CV, or other professional documents',
      icon: Upload,
      action: () => navigate('/profile?tab=documents'),
      completed: hasDocuments
    },
    {
      id: 'extract',
      title: 'Let AI extract your profile information',
      description: 'Process documents with AI to automatically populate your profile',
      icon: Brain,
      action: () => navigate('/profile?tab=documents'),
      completed: hasDocuments && hasProfileData
    },
    {
      id: 'interview',
      title: 'Start your first AI-powered interview',
      description: 'Have a conversation with our AI to enhance your profile',
      icon: Play,
      action: () => navigate('/interview'),
      completed: false // This would need to be tracked separately
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Welcome to CareerOS!</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of your AI-powered career platform
            </CardDescription>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{completedSteps}/{onboardingSteps.length} completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {onboardingSteps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
              step.completed 
                ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                : 'bg-background border-border hover:bg-muted/50'
            }`}
            onClick={step.action}
          >
            <div className={`p-2 rounded-full ${
              step.completed 
                ? 'bg-green-100 text-green-600' 
                : 'bg-primary/10 text-primary'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
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
            </div>
            
            <div className="flex items-center">
              {step.completed ? (
                <span className="text-sm text-green-600 font-medium">Completed</span>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    step.action();
                  }}
                >
                  Start
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {completedSteps === onboardingSteps.length && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-800 mb-1">
              Congratulations! You've completed the onboarding
            </h3>
            <p className="text-sm text-green-600 mb-3">
              You're all set to make the most of CareerOS
            </p>
            <Button onClick={() => navigate('/interview')}>
              Start Your Career Journey
              <Brain className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WelcomeOnboarding;
