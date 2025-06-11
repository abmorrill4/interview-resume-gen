
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStorage } from "@/hooks/useResumeStorage";
import Interview from "@/components/Interview";

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

const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveResume } = useResumeStorage();
  const [userData] = useState<UserData>({
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

  const handleInterviewComplete = async (data: UserData, messages: Message[]) => {
    // Save interview data to database
    await saveResume(data, messages);
    
    // Navigate to summary with state
    navigate('/interview/summary', { 
      state: { 
        messages,
        userData: data 
      } 
    });
  };

  return (
    <Interview 
      onComplete={handleInterviewComplete} 
      initialData={userData} 
    />
  );
};

export default InterviewPage;
