
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Stack, Text, Surface, Grid } from '@/components/ui/design-system';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'AI Interview',
      description: 'Get personalized career insights and AI-powered guidance',
      icon: Brain,
      action: () => navigate('/interview'),
      primary: true,
      gradient: 'from-purple-600 via-blue-600 to-cyan-500',
      glowColor: 'shadow-purple-500/30',
      bgClass: 'gradient-primary',
      dataTour: 'ai-interview'
    },
    {
      title: 'Profile Hub',
      description: 'Manage and enhance your professional information',
      icon: Briefcase,
      action: () => navigate('/profile'),
      primary: false,
      gradient: 'from-green-500 via-teal-500 to-blue-500',
      glowColor: 'shadow-green-500/30',
      bgClass: 'gradient-secondary',
      dataTour: 'profile-hub'
    },
    {
      title: 'Resume Builder',
      description: 'Create stunning, AI-optimized resumes',
      icon: FileText,
      action: () => console.log('Resume builder coming soon'),
      primary: false,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      glowColor: 'shadow-orange-500/30',
      bgClass: 'gradient-tertiary'
    }
  ];

  return (
    <Grid responsive={{ sm: 1, md: 3 }} gap="xl" className="quick-actions">
      {quickActions.map((action, index) => (
        <Card 
          key={action.title}
          className="group cursor-pointer transition-all duration-300 hover:scale-105 card-glow border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm overflow-hidden relative"
          onClick={action.action}
          style={{ animationDelay: `${0.8 + index * 0.1}s` }}
          data-tour={action.dataTour}
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
               style={{background: `linear-gradient(135deg, ${action.gradient.split(' ')[1]}, ${action.gradient.split(' ')[3]})`}} />
          
          <CardHeader className="text-center pb-4 relative z-10">
            <Stack align="center" gap="lg">
              <Surface 
                variant="ghost" 
                padding="lg" 
                radius="2xl" 
                className={`${action.bgClass} animate-gradient group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="h-8 w-8 text-white" />
              </Surface>
              <Stack gap="sm" align="center">
                <Text 
                  size="xl" 
                  weight="bold" 
                  family="display" 
                  className="group-hover:text-gradient transition-all duration-300"
                >
                  {action.title}
                </Text>
                <Text variant="muted" align="center" className="leading-relaxed">
                  {action.description}
                </Text>
              </Stack>
            </Stack>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <Button 
              variant={action.primary ? "default" : "outline"}
              className={`w-full transition-all duration-300 ${action.primary ? 'btn-primary' : 'hover:bg-gradient-primary hover:text-white border-primary/30'}`}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
              }}
            >
              {action.primary ? 'Start Interview' : 'Explore'}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
};

export default QuickActions;
