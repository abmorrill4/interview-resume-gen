
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useResumeStorage } from "@/hooks/useResumeStorage";
import RealtimeInterview from "@/components/RealtimeInterview";
import InterviewSummary from "@/components/InterviewSummary";
import Navigation from "@/components/Navigation";
import LandingHero from "@/components/LandingHero";
import ModuleShowcase from "@/components/ModuleShowcase";

type AppState = 'welcome' | 'interview' | 'summary';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { saveResume } = useResumeStorage();
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [interviewMessages, setInterviewMessages] = useState<Message[]>([]);
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

  const handleInterviewComplete = async (data: UserData, messages: Message[]) => {
    setUserData(data);
    setInterviewMessages(messages);
    
    // Save interview data to database
    await saveResume(data, messages);
    
    setCurrentState('summary');
  };

  const handleStartOver = () => {
    setCurrentState('welcome');
    setInterviewMessages([]);
    setUserData({
      personalInfo: { fullName: '', email: '', phone: '', linkedin: '' },
      workExperience: [],
      education: [],
      skills: [],
      achievements: []
    });
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
    return <RealtimeInterview onComplete={handleInterviewComplete} initialData={userData} />;
  }

  if (currentState === 'summary') {
    return <InterviewSummary messages={interviewMessages} onStartOver={handleStartOver} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <LandingHero onStartInterview={handleStartInterview} />
      <ModuleShowcase onStartInterview={handleStartInterview} />
    </div>
  );
};

export default Index;
