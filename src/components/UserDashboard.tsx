

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
      bgClass: 'gradient-primary'
    },
    {
      title: 'Profile Hub',
      description: 'Manage and enhance your professional information',
      icon: Briefcase,
      action: () => navigate('/profile'),
      primary: false,
      gradient: 'from-green-500 via-teal-500 to-blue-500',
      glowColor: 'shadow-green-500/30',
      bgClass: 'gradient-secondary'
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 text-center slide-up">
            <div className="inline-flex items-center gap-2 bg-gradient-primary rounded-full px-6 py-3 mb-8 hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span className="text-sm font-semibold text-white">AI-Powered Career Platform</span>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-gradient animate-gradient text-shadow">
              Welcome to CareerOS
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your career journey with AI-powered insights, dynamic interviews, and personalized guidance designed to unlock your full potential.
            </p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Profile and Progress */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile Summary */}
              <div className="fade-in-up">
                <UserProfileSummary />
              </div>
              
              {/* Interview Progress */}
              <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                <InterviewProgress />
              </div>
              
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {systemStats.map((stat, index) => (
                  <Card 
                    key={stat.label} 
                    className="card-glow border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground mb-2">{stat.value}</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-neon-green" />
                            <span className="text-sm font-semibold text-neon-green">{stat.trend}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-primary rounded-xl floating">
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column - Career Insights */}
            <div className="space-y-8">
              <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
                <CareerInsights />
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {quickActions.map((action, index) => (
              <Card 
                key={action.title}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 card-glow border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm overflow-hidden relative"
                onClick={action.action}
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                     style={{background: `linear-gradient(135deg, ${action.gradient.split(' ')[1]}, ${action.gradient.split(' ')[3]})`}} />
                
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className={`mx-auto mb-6 p-4 rounded-2xl w-fit ${action.bgClass} animate-gradient group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-display font-bold text-foreground group-hover:text-gradient transition-all duration-300">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {action.description}
                  </CardDescription>
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
          </div>

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
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-primary rounded-xl">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-display">Recent Activity</CardTitle>
                      <CardDescription className="text-lg">Your career development progress</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 relative z-10">
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-secondary rounded-full mb-6 pulse-glow">
                      <Rocket className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-4">Amazing Progress!</h3>
                    <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                      You're making great strides in your career development. Keep the momentum going!
                    </p>
                    <Button 
                      className="btn-primary text-lg px-8 py-4"
                      onClick={() => navigate('/interview')}
                    >
                      Continue Your Journey
                      <Brain className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

