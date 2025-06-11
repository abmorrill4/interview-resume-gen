
import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { Container, Stack, Text, Surface } from '@/components/ui/design-system';

const WelcomeHeader: React.FC = () => {
  return (
    <Stack align="center" gap="xl" className="slide-up dashboard-welcome">
      <Surface variant="ghost" padding="lg" radius="full" className="bg-gradient-primary hover:scale-105 transition-transform duration-300">
        <Stack direction="row" gap="sm" align="center">
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
          <Text size="sm" weight="semibold" className="text-white">AI-Powered Career Platform</Text>
          <Zap className="h-4 w-4 text-white" />
        </Stack>
      </Surface>
      
      <Text 
        as="h1" 
        size="6xl" 
        weight="bold" 
        variant="gradient" 
        family="display" 
        align="center"
        className="animate-gradient text-shadow"
      >
        Welcome to CareerOS
      </Text>
      
      <Text 
        size="xl" 
        variant="muted" 
        align="center" 
        className="max-w-3xl leading-relaxed"
      >
        Transform your career journey with AI-powered insights, dynamic interviews, and personalized guidance designed to unlock your full potential.
      </Text>
    </Stack>
  );
};

export default WelcomeHeader;
