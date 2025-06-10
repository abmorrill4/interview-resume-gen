import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Bot, User, Sparkles, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedInterview } from "@/hooks/useEnhancedInterview";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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

interface EnhancedInterviewProps {
  onComplete: (data: UserData) => void;
  initialData: UserData;
}

const EnhancedInterview: React.FC<EnhancedInterviewProps> = ({ onComplete, initialData }) => {
  const { toast } = useToast();
  const { enhanceContent, isEnhancing } = useEnhancedInterview();
  const { messages, sendMessage, isLoading: isChatLoading, clearMessages } = useVoiceChat();
  const { speak, isPlaying, stop } = useTextToSpeech();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const questions = [
    {
      id: 'fullName',
      text: "Let's start with the basics. What's your full name?",
      type: 'text',
      category: 'personalInfo',
      required: true
    },
    {
      id: 'email',
      text: "What's your email address?",
      type: 'text',
      category: 'personalInfo',
      required: true
    },
    {
      id: 'phone',
      text: "What's your phone number?",
      type: 'text',
      category: 'personalInfo',
      required: true
    },
    {
      id: 'linkedin',
      text: "Do you have a LinkedIn profile? If so, please share the URL.",
      type: 'text',
      category: 'personalInfo',
      required: false
    },
    {
      id: 'workOverview',
      text: "Tell me about your work experience. Start with your most recent or current position. Include the job title, company name, dates, and what you did there.",
      type: 'textarea',
      category: 'workExperience',
      required: true
    },
    {
      id: 'previousWork',
      text: "Great! Do you have any previous work experience you'd like to include? Please describe your other roles, companies, and key responsibilities.",
      type: 'textarea',
      category: 'workExperience',
      required: false
    },
    {
      id: 'education',
      text: "Let's talk about your education. Please tell me about your degrees, certifications, or relevant educational background.",
      type: 'textarea',
      category: 'education',
      required: true
    },
    {
      id: 'skills',
      text: "What are your key skills? Include both technical skills (like software, programming languages, tools) and soft skills (like leadership, communication).",
      type: 'textarea',
      category: 'skills',
      required: true
    },
    {
      id: 'achievements',
      text: "Tell me about your achievements and accomplishments. These could be awards, successful projects, measurable results, or anything you're particularly proud of.",
      type: 'textarea',
      category: 'achievements',
      required: false
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const existingAnswer = answers[currentQuestion.id] || '';
    setCurrentAnswer(existingAnswer);
  }, [currentQuestionIndex, answers, currentQuestion.id]);

  useEffect(() => {
    if (isVoiceModeEnabled && currentQuestion) {
      speak(currentQuestion.text);
    }
  }, [currentQuestionIndex, isVoiceModeEnabled, speak, currentQuestion]);

  const handleEnhanceAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const enhanced = await enhanceContent(
      currentAnswer,
      currentQuestion.category,
      `This is for a ${currentQuestion.id} section of a resume.`
    );
    
    if (enhanced !== currentAnswer) {
      setCurrentAnswer(enhanced);
      toast({
        title: "Answer enhanced!",
        description: "Your response has been improved by AI.",
      });
    }
  };

  const handleNext = async () => {
    if (currentQuestion.required && !currentAnswer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before continuing.",
        variant: "destructive"
      });
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: currentAnswer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      await completeInterview();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: currentAnswer
      }));
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const completeInterview = async () => {
    setIsLoading(true);
    
    try {
      const processedData: UserData = {
        personalInfo: {
          fullName: answers.fullName || '',
          email: answers.email || '',
          phone: answers.phone || '',
          linkedin: answers.linkedin || ''
        },
        workExperience: parseWorkExperience(answers.workOverview, answers.previousWork),
        education: parseEducation(answers.education),
        skills: parseSkills(answers.skills),
        achievements: parseAchievements(answers.achievements)
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(processedData);
      
      toast({
        title: "Interview complete!",
        description: "Your resume is being generated...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue processing your interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseWorkExperience = (overview: string, previous: string) => {
    const experiences = [];
    const allText = `${overview} ${previous || ''}`.trim();
    
    if (allText) {
      experiences.push({
        jobTitle: "Position Title",
        company: "Company Name",
        startDate: "Start Date",
        endDate: "End Date",
        responsibilities: [allText]
      });
    }
    
    return experiences;
  };

  const parseEducation = (educationText: string) => {
    if (!educationText) return [];
    
    return [{
      degree: "Degree",
      field: "Field of Study",
      university: "University Name",
      graduationYear: "Graduation Year"
    }];
  };

  const parseSkills = (skillsText: string) => {
    if (!skillsText) return [];
    return skillsText.split(',').map(skill => skill.trim()).filter(Boolean);
  };

  const parseAchievements = (achievementsText: string) => {
    if (!achievementsText) return [];
    return achievementsText.split('\n').map(achievement => achievement.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">Enhanced AI Interview</h1>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    setIsVoiceModeEnabled(!isVoiceModeEnabled);
                    if (isVoiceModeEnabled) {
                      stop();
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className={isVoiceModeEnabled ? "bg-blue-100" : ""}
                >
                  {isVoiceModeEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  Voice Mode
                </Button>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-0 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Interviewer
                {isPlaying && <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full ml-2" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Your Response
                </div>
                {currentQuestion.type === 'textarea' && (
                  <Button
                    onClick={handleEnhanceAnswer}
                    disabled={isEnhancing || !currentAnswer.trim()}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isEnhancing ? 'Enhancing...' : 'Enhance'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === 'textarea' ? (
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-32 resize-none border-2 focus:border-blue-500"
                />
              ) : (
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="border-2 focus:border-blue-500"
                />
              )}
            </CardContent>
          </Card>

          {!showVoiceChat && (
            <div className="text-center mb-6">
              <Button
                onClick={() => setShowVoiceChat(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                Get AI Help with This Question
              </Button>
            </div>
          )}

          {showVoiceChat && (
            <Card className="border-0 shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI Career Assistant</span>
                  <Button
                    onClick={() => setShowVoiceChat(false)}
                    variant="ghost"
                    size="sm"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask for help with this question..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        sendMessage(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => clearMessages()}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={isEnhancing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
            >
              {currentQuestionIndex === questions.length - 1 ? (
                "Complete Interview"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInterview;
