
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InterviewSummary from '@/components/InterviewSummary';

const InterviewSummaryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { messages = [], userData } = location.state || {};

  const handleStartOver = () => {
    navigate('/dashboard');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  if (!messages || messages.length === 0) {
    navigate('/dashboard');
    return null;
  }

  return (
    <InterviewSummary 
      messages={messages} 
      onStartOver={handleStartOver}
      onViewProfile={handleViewProfile}
    />
  );
};

export default InterviewSummaryPage;
