import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Bot, User, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeInterview } from "@/hooks/useRealtimeInterview";
import DynamicQuestion from "@/components/interview/DynamicQuestion";
import { DynamicQuestion as QuestionType, InterviewResponse } from '@/types/InterviewTypes';

export type InterviewMode = 'structured' | 'dynamic' | 'voice' | 'realtime';

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

interface InterviewProps {
  onComplete: (data: UserData, messages: Message[]) => void;
  initialData: UserData;
  mode: InterviewMode;
  onModeChange: (mode: InterviewMode) => void;
  contextType?: string;
  contextData?: any;
  isTargeted?: boolean;
}

const Interview: React.FC<InterviewProps> = ({
  onComplete,
  initialData,
  mode,
  onModeChange,
  contextType,
  contextData,
  isTargeted
}) => {
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData>(initialData);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Dynamic interview state
  const [dynamicQuestions, setDynamicQuestions] = useState<QuestionType[]>([]);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<any>('');

  // Voice interview state - add default values for missing properties
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    isRecording,
    connect,
    disconnect,
    sendMessage,
    messages: voiceMessages
  } = useRealtimeInterview({ contextType, contextData });

  // Add fallback values for missing properties
  const isListening = isRecording;
  const error = null;

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string>('');

  // Structured interview questions
  const structuredQuestions = [
    {
      id: 'personal-info',
      question: "Let's start with your basic information. What's your full name?",
      field: 'personalInfo.fullName',
      type: 'text'
    },
    {
      id: 'email',
      question: "What's your email address?",
      field: 'personalInfo.email',
      type: 'email'
    },
    {
      id: 'phone',
      question: "What's your phone number?",
      field: 'personalInfo.phone',
      type: 'tel'
    },
    {
      id: 'linkedin',
      question: "Do you have a LinkedIn profile? Please share the URL.",
      field: 'personalInfo.linkedin',
      type: 'url'
    },
    {
      id: 'experience',
      question: "Tell me about your work experience. What was your most recent job title?",
      field: 'workExperience',
      type: 'experience'
    },
    {
      id: 'education',
      question: "What's your educational background? What degree did you earn?",
      field: 'education',
      type: 'education'
    },
    {
      id: 'skills',
      question: "What are your key skills? Please list them separated by commas.",
      field: 'skills',
      type: 'skills'
    },
    {
      id: 'achievements',
      question: "What are some of your notable achievements or accomplishments?",
      field: 'achievements',
      type: 'achievements'
    }
  ];

  // Initialize dynamic questions when mode changes
  useEffect(() => {
    if (mode === 'dynamic') {
      initializeDynamicQuestions();
    }
  }, [mode]);

  // Voice interview effects
  useEffect(() => {
    if ((mode === 'voice' || mode === 'realtime') && !isConnected) {
      handleVoiceConnect();
    }
  }, [mode, isConnected]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Interview Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const initializeDynamicQuestions = () => {
    // Sample dynamic questions - in a real app, these would come from the DynamicInterviewService
    const questions: QuestionType[] = [
      {
        id: 'experience-level',
        text: 'How many years of professional experience do you have?',
        type: 'multiple_choice',
        category: 'experience',
        required: true,
        options: [
          { value: '0-1', label: '0-1 years (Entry level)' },
          { value: '2-5', label: '2-5 years (Junior)' },
          { value: '6-10', label: '6-10 years (Mid-level)' },
          { value: '10+', label: '10+ years (Senior)' }
        ]
      },
      {
        id: 'current-role',
        text: 'What is your current job title?',
        type: 'text',
        category: 'experience',
        required: true
      },
      {
        id: 'skills-rating',
        text: 'How would you rate your overall technical skills?',
        type: 'rating',
        category: 'skills',
        required: true,
        scale: {
          min: 1,
          max: 10,
          labels: {
            min: 'Beginner',
            max: 'Expert'
          }
        }
      }
    ];
    setDynamicQuestions(questions);
  };

  const handleVoiceConnect = async () => {
    try {
      await connect();
      const welcomeMessage = "Hello! Welcome to your AI-powered interview. I'll be asking you questions about your background and experience. Are you ready to begin?";
      setLastQuestion(welcomeMessage);
      
      if (!isMuted) {
        // In a real implementation, you'd use text-to-speech here
        console.log('AI would speak:', welcomeMessage);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the voice interview system.",
        variant: "destructive"
      });
    }
  };

  const getCurrentQuestion = () => {
    if (mode === 'dynamic') {
      return dynamicQuestions[currentQuestionIndex];
    }
    return structuredQuestions[currentQuestionIndex];
  };

  const isLastQuestion = () => {
    if (mode === 'dynamic') {
      return currentQuestionIndex >= dynamicQuestions.length - 1;
    }
    return currentQuestionIndex >= structuredQuestions.length - 1;
  };

  const handleNext = () => {
    if (mode === 'dynamic') {
      handleDynamicNext();
    } else {
      handleStructuredNext();
    }
  };

  const handleDynamicNext = () => {
    const currentQuestion = dynamicQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Save response
    const response: InterviewResponse = {
      questionId: currentQuestion.id,
      value: currentResponse,
      timestamp: new Date()
    };
    
    setResponses(prev => [...prev, response]);

    if (isLastQuestion()) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse('');
    }
  };

  const handleStructuredNext = () => {
    const currentQ = structuredQuestions[currentQuestionIndex];
    if (!currentQ) return;

    // Update userData based on field path
    const updatedData = { ...userData };
    const fieldPath = currentQ.field.split('.');
    
    if (fieldPath.length === 2) {
      (updatedData as any)[fieldPath[0]][fieldPath[1]] = currentResponse;
    } else if (fieldPath[0] === 'skills' || fieldPath[0] === 'achievements') {
      (updatedData as any)[fieldPath[0]] = typeof currentResponse === 'string' 
        ? currentResponse.split(',').map(s => s.trim())
        : currentResponse;
    }
    
    setUserData(updatedData);

    // Add to messages
    const newMessages: Message[] = [
      ...messages,
      { role: 'assistant', content: currentQ.question, timestamp: new Date() },
      { role: 'user', content: String(currentResponse), timestamp: new Date() }
    ];
    setMessages(newMessages);

    if (isLastQuestion()) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      if (mode === 'dynamic' && responses.length > 0) {
        const prevResponse = responses[responses.length - 1];
        setCurrentResponse(prevResponse.value);
        setResponses(prev => prev.slice(0, -1));
      }
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    
    if (mode === 'voice' || mode === 'realtime') {
      disconnect();
    }

    const finalData = mode === 'dynamic' ? convertResponsesToUserData() : userData;
    const finalMessages = (mode === 'voice' || mode === 'realtime') ? voiceMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date()
    })) : messages;

    onComplete(finalData, finalMessages);
  };

  const convertResponsesToUserData = (): UserData => {
    // Convert dynamic responses to UserData format
    const data: UserData = {
      personalInfo: { fullName: '', email: '', phone: '', linkedin: '' },
      workExperience: [],
      education: [],
      skills: [],
      achievements: []
    };

    responses.forEach(response => {
      switch (response.questionId) {
        case 'current-role':
          if (typeof response.value === 'string') {
            data.workExperience.push({
              jobTitle: response.value,
              company: '',
              startDate: '',
              endDate: '',
              responsibilities: []
            });
          }
          break;
        // Add more cases as needed
      }
    });

    return data;
  };

  const handleVoiceMessage = (message: string) => {
    if (isPaused) return;
    sendMessage(message);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const repeatQuestion = () => {
    if (lastQuestion && !isMuted) {
      console.log('AI would repeat:', lastQuestion);
    }
  };

  const getProgress = () => {
    const total = mode === 'dynamic' ? dynamicQuestions.length : structuredQuestions.length;
    return total > 0 ? ((currentQuestionIndex + 1) / total) * 100 : 0;
  };

  const canGoNext = () => {
    if (mode === 'voice' || mode === 'realtime') return false;
    return currentResponse && String(currentResponse).trim().length > 0;
  };

  const canGoPrevious = () => {
    return currentQuestionIndex > 0;
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Interview Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Thank you for completing the interview. Your responses are being processed.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'voice' || mode === 'realtime') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Voice Interview</h1>
            <p className="text-muted-foreground">
              Have a natural conversation with our AI interviewer
            </p>
          </div>

          {/* Status */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <Badge variant={isListening ? "default" : "outline"}>
                  {isListening ? "Listening..." : "Not Listening"}
                </Badge>
                <Badge variant={isSpeaking ? "default" : "outline"}>
                  {isSpeaking ? "AI Speaking..." : "AI Ready"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={togglePause}
                  disabled={!isConnected}
                  variant={isPaused ? "default" : "outline"}
                  size="lg"
                >
                  {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>

                <Button
                  onClick={toggleMute}
                  disabled={!isConnected}
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                >
                  {isMuted ? <VolumeX className="h-5 w-5 mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
                  {isMuted ? "Unmute AI" : "Mute AI"}
                </Button>

                <Button
                  onClick={repeatQuestion}
                  disabled={!isConnected || isPaused}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Repeat Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card className="min-h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {voiceMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Complete Button */}
          <div className="text-center">
            <Button onClick={handleComplete} size="lg" className="w-48">
              Complete Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'dynamic') {
    const currentQuestion = getCurrentQuestion() as QuestionType;
    
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <p className="text-muted-foreground">Loading questions...</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Dynamic Interview</h1>
            <p className="text-muted-foreground">
              Personalized questions based on your responses
            </p>
          </div>

          {/* Progress */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} of {dynamicQuestions.length}
                </span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </CardContent>
          </Card>

          {/* Question */}
          <DynamicQuestion
            question={currentQuestion}
            value={currentResponse}
            onChange={setCurrentResponse}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
            canGoPrevious={canGoPrevious()}
            isLast={isLastQuestion()}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={dynamicQuestions.length}
          />
        </div>
      </div>
    );
  }

  // Structured interview mode
  const currentQuestion = structuredQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Structured Interview</h1>
          <p className="text-muted-foreground">
            Step-by-step questions to build your profile
          </p>
        </div>

        {/* Progress */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {structuredQuestions.length}
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Interviewer
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {structuredQuestions.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-6">{currentQuestion.question}</p>
            <input
              type={currentQuestion.type === 'text' ? 'text' : currentQuestion.type}
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border-2 border-border rounded-md focus:border-primary focus:outline-none"
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={!canGoPrevious()}
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            {isLastQuestion() ? 'Complete Interview' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
