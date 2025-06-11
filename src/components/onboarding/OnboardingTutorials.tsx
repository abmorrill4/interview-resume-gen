
import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const TUTORIAL_STEPS: Record<string, Step[]> = {
  'welcome-tour': [
    {
      target: '.dashboard-welcome',
      content: 'Welcome to CareerOS! This is your personal career command center where AI helps you grow professionally.',
      placement: 'bottom'
    },
    {
      target: '.quick-actions',
      content: 'These are your main actions. Start with AI Interview to get personalized insights about your career.',
      placement: 'top'
    },
    {
      target: '.profile-summary',
      content: 'Your profile summary shows your current career data. As you add more information, this will become more detailed.',
      placement: 'right'
    }
  ],
  'document-upload-tour': [
    {
      target: '[data-tour="profile-hub"]',
      content: 'Click here to access your Profile Hub where you can upload documents.',
      placement: 'bottom'
    },
    {
      target: '.documents-tab',
      content: 'In the Documents tab, you can upload your resume, CV, and other professional documents.',
      placement: 'bottom'
    }
  ],
  'ai-extraction-tour': [
    {
      target: '.ai-extract-button',
      content: 'After uploading documents, click here to let AI extract and organize your professional information.',
      placement: 'top'
    }
  ],
  'interview-tour': [
    {
      target: '[data-tour="ai-interview"]',
      content: 'Start your AI-powered interview here. The AI will ask intelligent questions to understand your career goals.',
      placement: 'bottom'
    }
  ],
  'profile-tour': [
    {
      target: '.profile-overview',
      content: 'Review your automatically generated profile here. You can edit and enhance any information.',
      placement: 'bottom'
    }
  ]
};

export const OnboardingTutorials: React.FC = () => {
  const { activeTutorial, setActiveTutorial, completeStep } = useOnboarding();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (activeTutorial) {
      setRun(true);
    }
  }, [activeTutorial]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      
      // Complete the step when tutorial finishes
      if (activeTutorial) {
        const stepMap: Record<string, string> = {
          'welcome-tour': 'welcome',
          'document-upload-tour': 'upload-document',
          'ai-extraction-tour': 'ai-extraction',
          'interview-tour': 'first-interview',
          'profile-tour': 'profile-review'
        };
        
        const stepId = stepMap[activeTutorial];
        if (stepId) {
          completeStep(stepId);
        }
      }
      
      setActiveTutorial(null);
    }
  };

  const steps = activeTutorial ? TUTORIAL_STEPS[activeTutorial] || [] : [];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
        },
        tooltip: {
          borderRadius: '8px',
          padding: '20px',
          fontSize: '14px'
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px'
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '10px'
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))'
        }
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Complete',
        next: 'Next',
        skip: 'Skip tour'
      }}
    />
  );
};
