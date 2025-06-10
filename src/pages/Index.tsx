
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Users } from "lucide-react";
import Interview from "@/components/Interview";
import Resume from "@/components/Resume";

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

  const handleStartInterview = () => {
    setCurrentState('interview');
  };

  const handleInterviewComplete = (data: UserData) => {
    setUserData(data);
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

  if (currentState === 'interview') {
    return <Interview onComplete={handleInterviewComplete} initialData={userData} />;
  }

  if (currentState === 'resume') {
    return <Resume userData={userData} onStartOver={handleStartOver} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Resume Creator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Let our AI interview you and create a professional, polished resume in minutes. 
            No more staring at blank templates or struggling with formatting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">AI Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Our AI conducts a personalized interview, asking the right questions to understand your unique background and experience.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-indigo-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Smart Enhancement</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your responses are intelligently enhanced and refined to create compelling, professional content that stands out.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Perfect Format</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get a beautifully formatted markdown resume that's compatible with any platform and ready to share with employers.
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
            Start AI Interview
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes about 5-10 minutes • Completely free • No registration required
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
