
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Briefcase, ArrowRight, Zap, Target, TrendingUp, Cpu, Database, BarChart3, Upload, CheckCircle2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileStats, fetchProfileStats } = useProfileData();

  useEffect(() => {
    if (user) {
      fetchProfileStats();
    }
  }, [user, fetchProfileStats]);

  // Check if user is new (has no profile data)
  const isNewUser = profileStats && 
    profileStats.experienceCount === 0 && 
    profileStats.skillsCount === 0 && 
    profileStats.educationCount === 0 && 
    profileStats.projectsCount === 0 && 
    profileStats.achievementsCount === 0;

  const quickActions = [
    {
      title: 'AI Interview',
      description: 'Get personalized career insights and recommendations',
      icon: Brain,
      action: () => navigate('/interview'),
      primary: true,
      gradient: 'from-blue-500 to-cyan-400',
      glowColor: 'shadow-blue-500/25'
    },
    {
      title: 'Profile Hub',
      description: 'Manage your professional information',
      icon: Briefcase,
      action: () => navigate('/profile'),
      primary: false,
      gradient: 'from-purple-500 to-pink-400',
      glowColor: 'shadow-purple-500/25'
    },
    {
      title: 'Resume Builder',
      description: 'Create and manage your resume',
      icon: FileText,
      action: () => console.log('Resume builder coming soon'),
      primary: false,
      gradient: 'from-orange-500 to-red-400',
      glowColor: 'shadow-orange-500/25'
    }
  ];

  const systemStats = [
    { label: 'Interviews', value: '2.4K', icon: Cpu, trend: '+12%' },
    { label: 'Profiles', value: '89', icon: Database, trend: '+24%' },
    { label: 'Success Rate', value: '94.2%', icon: BarChart3, trend: '+8%' },
  ];

  const onboardingSteps = [
    {
      title: 'Upload your first document',
      description: 'Upload your Resume, CV, or other professional documents',
      icon: Upload,
      action: () => navigate('/profile?tab=documents'),
      completed: false
    },
    {
      title: 'Let AI extract your profile information',
      description: 'Process documents with AI to automatically populate your profile',
      icon: Brain,
      action: () => navigate('/profile?tab=documents'),
      completed: false
    },
    {
      title: 'Start your first AI-powered interview',
      description: 'Have a conversation with our AI to enhance your profile',
      icon: Play,
      action: () => navigate('/interview'),
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Ready to Start</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Welcome to CareerOS
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered career platform. Get started with your career development.
            </p>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {systemStats.map((stat, index) => (
              <Card key={stat.label} className="bg-card border border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend}
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {quickActions.map((action, index) => (
              <Card 
                key={action.title}
                className="group cursor-pointer transition-all duration-200 hover:scale-105 bg-card border border-border hover:border-primary/20"
                onClick={action.action}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-6 p-4 rounded-xl w-fit bg-gradient-to-r ${action.gradient}`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={action.primary ? "default" : "outline"}
                    className="w-full transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                  >
                    {action.primary ? 'Start Interview' : 'Open'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Onboarding or Activity Section */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                {isNewUser ? (
                  <>
                    <Zap className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-xl">Welcome! Let's get you started</CardTitle>
                      <CardDescription>Complete these steps to build your professional profile</CardDescription>
                    </div>
                  </>
                ) : (
                  <>
                    <Target className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-xl">Recent Activity</CardTitle>
                      <CardDescription>Your career development progress</CardDescription>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isNewUser ? (
                <div className="space-y-4">
                  {onboardingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={step.action}>
                      <div className={`p-2 rounded-full ${step.completed ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Database className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg">Great progress on your profile!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Continue developing your career with more interviews and profile updates.
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => navigate('/interview')}
                  >
                    Start Another Interview
                    <Brain className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
