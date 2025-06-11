
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResumeStorage } from "@/hooks/useResumeStorage";
import Interview, { InterviewMode } from "@/components/Interview";

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
  const location = useLocation();
  const { saveResume } = useResumeStorage();
  
  // Check if this is a targeted interview from navigation state
  const isTargetedInterview = location.state?.mode === 'targeted';
  const contextType = location.state?.contextType;
  const contextData = location.state?.contextData;
  
  const [interviewMode, setInterviewMode] = useState<InterviewMode>(
    isTargetedInterview ? 'realtime' : 'dynamic'
  );
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

  useEffect(() => {
    // If this is a targeted interview, force realtime mode
    if (isTargetedInterview) {
      setInterviewMode('realtime');
    }
  }, [isTargetedInterview]);

  const handleInterviewComplete = async (data: UserData, messages: Message[]) => {
    // Save interview data to database
    await saveResume(data, messages);
    
    // Navigate to summary with state
    navigate('/interview/summary', { 
      state: { 
        messages,
        userData: data,
        isTargeted: isTargetedInterview,
        contextType,
        contextData
      } 
    });
  };

  return (
    <Interview 
      onComplete={handleInterviewComplete} 
      initialData={userData}
      mode={interviewMode}
      onModeChange={setInterviewMode}
      contextType={contextType}
      contextData={contextData}
      isTargeted={isTargetedInterview}
    />
  );
};

export default InterviewPage;
