
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Stack, Text, Surface } from '@/components/ui/design-system';
import WelcomeOnboarding from '../WelcomeOnboarding';

interface ActivitySectionProps {
  isNewUser: boolean;
  hasDocuments: boolean;
  hasProfileData: boolean;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ isNewUser, hasDocuments, hasProfileData }) => {
  const navigate = useNavigate();

  if (isNewUser) {
    return (
      <WelcomeOnboarding 
        hasDocuments={hasDocuments}
        hasProfileData={hasProfileData}
      />
    );
  }

  return (
    <Card className="card-glow border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-accent opacity-5" />
      <CardHeader className="relative z-10">
        <Stack direction="row" gap="lg" align="center">
          <Surface variant="ghost" padding="md" radius="xl" className="bg-gradient-primary">
            <Target className="h-6 w-6 text-white" />
          </Surface>
          <Stack gap="xs">
            <Text size="2xl" weight="bold" family="display">Recent Activity</Text>
            <Text size="lg" variant="muted">Your career development progress</Text>
          </Stack>
        </Stack>
      </CardHeader>
      <CardContent className="p-8 relative z-10">
        <Stack align="center" gap="xl" className="py-16">
          <Surface 
            variant="ghost" 
            padding="xl" 
            radius="full" 
            className="bg-gradient-secondary pulse-glow"
          >
            <Rocket className="h-10 w-10 text-white" />
          </Surface>
          <Stack gap="lg" align="center">
            <Text size="2xl" weight="bold" family="display">Amazing Progress!</Text>
            <Text variant="muted" size="lg" align="center" className="max-w-md">
              You're making great strides in your career development. Keep the momentum going!
            </Text>
          </Stack>
          <Button 
            className="btn-primary text-lg px-8 py-4"
            onClick={() => navigate('/interview')}
          >
            Continue Your Journey
            <Brain className="h-5 w-5 ml-2" />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActivitySection;
