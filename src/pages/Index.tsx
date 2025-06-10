import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Users, Mic, Brain, Zap, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useResumeStorage } from "@/hooks/useResumeStorage";
import EnhancedInterview from "@/components/EnhancedInterview";
import RealtimeResume from "@/components/RealtimeResume";

type AppState = 'welcome' | 'interview' | 'resume';

interface UserData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
  };
  workExperience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    university: string;
    graduationYear: string;
  }>;
  skills: string[];
  achievements: string[];
}

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { saveResume } = useResumeStorage();
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [userData, setUserData] = useState<UserData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: ''
    },
    workExperience: [],
    education: [],
    skills: [],
    achievements: []
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleStartInterview = () => {
    setCurrentState('interview');
  };

  const handleInterviewComplete = async (data: UserData) => {
    setUserData(data);
    
    // Save resume to database
    await saveResume(data);
    
    setCurrentState('resume');
  };

  const handleStartOver = () => {
    setCurrentState('welcome');
    setUserData({
      personalInfo: { fullName: '', email: '', phone: '', linkedin: '' },
      workExperience: [],
      education: [],
      skills: [],
      achievements: []
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page via useEffect
  }

  if (currentState === 'interview') {
    return <EnhancedInterview onComplete={handleInterviewComplete} initialData={userData} />;
  }

  if (currentState === 'resume') {
    return <RealtimeResume userData={userData} onStartOver={handleStartOver} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header with user info and sign out */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Enhanced AI Resume Creator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience the future of resume creation with AI-powered enhancement, real-time updates, 
            and interactive voice assistance. Create professional resumes that stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">AI-Enhanced Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Our advanced AI conducts personalized interviews with real-time content enhancement 
                and intelligent suggestions to bring out your best qualities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-indigo-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Real-Time Enhancement</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Watch your resume improve instantly with AI-powered content enhancement, 
                live preview updates, and smart formatting suggestions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Voice Assistance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get personalized career advice through our interactive voice chat system 
                and text-to-speech capabilities for a truly hands-free experience.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Interactive Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get instant help and career advice through our AI assistant chat feature 
                available throughout the interview process.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Smart Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Every section of your resume is intelligently enhanced with industry-specific 
                terminology and achievement-focused language.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-teal-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle className="text-lg">Perfect Format</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get beautifully formatted markdown resumes with live preview, 
                real-time updates, and professional styling that works everywhere.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleStartInterview}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Enhanced AI Interview
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Experience the future of resume creation • AI-powered • Voice-enabled • Real-time updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
