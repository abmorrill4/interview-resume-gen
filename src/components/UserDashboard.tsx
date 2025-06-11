
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Briefcase, ArrowRight, Zap, Target, TrendingUp, Cpu, Database, BarChart3, Sparkles, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import WelcomeOnboarding from "./WelcomeOnboarding";
import UserProfileSummary from "./UserProfileSummary";
import InterviewProgress from "./InterviewProgress";
import CareerInsights from "./CareerInsights";
import { Container, Stack, Text, Surface, Grid } from "@/components/ui/design-system";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileStats, fetchProfileStats } = useProfileData();
  const { documents, fetchDocuments } = useDocumentUpload();

  useEffect(() => {
    if (user) {
      fetchProfileStats();
      fetchDocuments();
    }
  }, [user, fetchProfileStats, fetchDocuments]);

  // Check if user is new (has no profile data or documents)
  const hasDocuments = documents.length > 0;
  const hasProfileData = profileStats && (
    profileStats.experienceCount > 0 || 
    profileStats.skillsCount > 0 || 
    profileStats.educationCount > 0 || 
    profileStats.projectsCount > 0 || 
    profileStats.achievementsCount > 0
  );

  const isNewUser = !hasDocuments && !hasProfileData;

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

  const systemStats = [
    { label: 'Interviews', value: '2.4K', icon: Cpu, trend: '+12%', color: 'text-electric-blue' },
    { label: 'Profiles', value: '89', icon: Database, trend: '+24%', color: 'text-neon-green' },
    { label: 'Success Rate', value: '94.2%', icon: BarChart3, trend: '+8%', color: 'text-sunset-orange' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Container maxWidth="7xl" padding="xl">
        <Stack gap="6xl">
          {/* Welcome Section */}
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

          {/* Main Dashboard Grid */}
          <Grid responsive={{ lg: 2, xl: 3 }} gap="xl">
            {/* Left Column - Profile and Progress */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile Summary */}
              <div className="fade-in-up profile-summary">
                <UserProfileSummary />
              </div>
              
              {/* Interview Progress */}
              <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                <InterviewProgress />
              </div>
              
              {/* System Stats */}
              <Grid responsive={{ sm: 1, md: 3 }} gap="lg">
                {systemStats.map((stat, index) => (
                  <Card 
                    key={stat.label} 
                    className="card-glow border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <Stack direction="row" justify="between" align="center">
                        <Stack gap="sm">
                          <Text size="sm" variant="muted" weight="medium">{stat.label}</Text>
                          <Text size="2xl" weight="bold">{stat.value}</Text>
                          <Stack direction="row" gap="sm" align="center">
                            <TrendingUp className="h-4 w-4 text-neon-green" />
                            <Text size="sm" weight="semibold" className="text-neon-green">{stat.trend}</Text>
                          </Stack>
                        </Stack>
                        <Surface variant="ghost" padding="md" radius="xl" className="bg-gradient-primary floating">
                          <stat.icon className="h-6 w-6 text-white" />
                        </Surface>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </div>

            {/* Right Column - Career Insights */}
            <Stack gap="xl">
              <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
                <CareerInsights />
              </div>
            </Stack>
          </Grid>

          {/* Quick Actions Grid */}
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

          {/* Onboarding or Activity Section */}
          <div className="fade-in-up" style={{ animationDelay: '1.2s' }}>
            {isNewUser ? (
              <WelcomeOnboarding 
                hasDocuments={hasDocuments}
                hasProfileData={!!hasProfileData}
              />
            ) : (
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
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
};

export default UserDashboard;
