
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  tutorial?: string; // Tutorial ID for joyride
  reward?: {
    type: 'badge' | 'feature' | 'points';
    value: string;
    description: string;
  };
}

interface OnboardingContextType {
  steps: OnboardingStep[];
  currentStep: number;
  totalSteps: number;
  progress: number;
  isOnboardingActive: boolean;
  activeTutorial: string | null;
  completedRewards: string[];
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  setActiveTutorial: (tutorialId: string | null) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

const INITIAL_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CareerOS',
    description: 'Get familiar with your new AI-powered career platform',
    completed: false,
    tutorial: 'welcome-tour',
    reward: {
      type: 'badge',
      value: 'welcome-badge',
      description: 'Welcome Explorer Badge'
    }
  },
  {
    id: 'upload-document',
    title: 'Upload Your First Document',
    description: 'Upload your resume or CV to get started',
    completed: false,
    tutorial: 'document-upload-tour',
    reward: {
      type: 'points',
      value: '100',
      description: '100 Career Points'
    }
  },
  {
    id: 'ai-extraction',
    title: 'AI Profile Extraction',
    description: 'Let AI analyze your documents and extract profile information',
    completed: false,
    tutorial: 'ai-extraction-tour',
    reward: {
      type: 'feature',
      value: 'advanced-analytics',
      description: 'Advanced Analytics Unlock'
    }
  },
  {
    id: 'first-interview',
    title: 'Start Your First AI Interview',
    description: 'Experience our intelligent interview system',
    completed: false,
    tutorial: 'interview-tour',
    reward: {
      type: 'badge',
      value: 'interview-master',
      description: 'Interview Master Badge'
    }
  },
  {
    id: 'profile-review',
    title: 'Review Your Profile',
    description: 'Check and enhance your automatically generated profile',
    completed: false,
    tutorial: 'profile-tour',
    reward: {
      type: 'points',
      value: '200',
      description: '200 Career Points'
    }
  }
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>(INITIAL_STEPS);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [completedRewards, setCompletedRewards] = useState<string[]>([]);

  // Load onboarding state from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`onboarding_${user.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        setSteps(data.steps || INITIAL_STEPS);
        setIsOnboardingActive(data.isActive || false);
        setCompletedRewards(data.rewards || []);
      } else {
        // New user - start onboarding
        setIsOnboardingActive(true);
      }
    }
  }, [user]);

  // Save onboarding state to localStorage
  const saveState = (newSteps: OnboardingStep[], active: boolean, rewards: string[]) => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify({
        steps: newSteps,
        isActive: active,
        rewards
      }));
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const currentStep = Math.min(completedSteps, steps.length - 1);
  const progress = (completedSteps / steps.length) * 100;

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    saveState(steps, true, completedRewards);
  };

  const completeStep = (stepId: string) => {
    const newSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    );
    
    const step = steps.find(s => s.id === stepId);
    let newRewards = [...completedRewards];
    
    if (step?.reward && !completedRewards.includes(step.reward.value)) {
      newRewards.push(step.reward.value);
    }

    setSteps(newSteps);
    setCompletedRewards(newRewards);
    
    // Check if all steps completed
    const allCompleted = newSteps.every(s => s.completed);
    if (allCompleted) {
      setIsOnboardingActive(false);
    }
    
    saveState(newSteps, !allCompleted, newRewards);
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    saveState(steps, false, completedRewards);
  };

  const resetOnboarding = () => {
    const resetSteps = INITIAL_STEPS.map(step => ({ ...step, completed: false }));
    setSteps(resetSteps);
    setIsOnboardingActive(true);
    setCompletedRewards([]);
    saveState(resetSteps, true, []);
  };

  return (
    <OnboardingContext.Provider value={{
      steps,
      currentStep,
      totalSteps: steps.length,
      progress,
      isOnboardingActive,
      activeTutorial,
      completedRewards,
      startOnboarding,
      completeStep,
      setActiveTutorial,
      skipOnboarding,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
