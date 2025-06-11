import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Sparkles, Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedInterview } from "@/hooks/useEnhancedInterview";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useRealtimeInterview } from "@/hooks/useRealtimeInterview";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import InterviewControls from "./InterviewControls";
import ProgressBar from "./interview/ProgressBar";
import Question from "./interview/Question";
import Answer from "./interview/Answer";
import Navigation from "./interview/Navigation";
import DynamicInterview from "./DynamicInterview";
import { InterviewResponse } from '@/types/InterviewTypes';

export type InterviewMode = 'text' | 'enhanced' | 'realtime' | 'dynamic' | 'personalized';

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
  mode?: InterviewMode;
  onModeChange?: (mode: InterviewMode) => void;
}

interface QuestionData {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'list';
  category: keyof UserData;
  required: boolean;
}

const Interview: React.FC<InterviewProps> = ({ 
  onComplete, 
  initialData, 
  mode = 'text',
  onModeChange 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Enhanced mode hooks
  const { enhanceContent, isEnhancing } = useEnhancedInterview();
  const { messages: chatMessages, sendMessage, isLoading: isChatLoading, clearMessages } = useVoiceChat();
  const { speak, isPlaying, stop } = useTextToSpeech();
  
  // Realtime mode hooks
  const {
    isConnected,
    isListening,
    isSpeaking,
    isPaused,
    isMuted,
    messages: realtimeMessages,
    connect,
    disconnect,
    togglePause,
    toggleMute,
    repeatLastQuestion,
    error: realtimeError,
    profileUpdates
  } = useRealtimeInterview();

  // Common state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  // Enhanced mode specific state
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [interviewTranscript, setInterviewTranscript] = useState<Array<{
    question: string;
    answer: string;
    timestamp: string;
  }>>([]);

  const questions: QuestionData[] = [
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

  const handleDynamicInterviewComplete = (responses: InterviewResponse[]) => {
    // Convert dynamic interview responses to UserData format
    const processedData = processDynamicResponsesToUserData(responses);
    const messages: Message[] = responses.map(response => ({
      role: 'assistant' as const,
      content: `Question: ${response.questionId}, Answer: ${response.value}`,
      timestamp: response.timestamp
    }));
    
    onComplete(processedData, messages);
  };

  const processDynamicResponsesToUserData = (responses: InterviewResponse[]): UserData => {
    const responseMap = new Map(responses.map(r => [r.questionId, r.value]));
    
    return {
      personalInfo: {
        fullName: responseMap.get('fullName') || user?.user_metadata?.full_name || '',
        email: responseMap.get('email') || user?.email || '',
        phone: responseMap.get('phone') || '',
        linkedin: responseMap.get('linkedin') || ''
      },
      workExperience: responseMap.get('work_experience_details') ? [{
        jobTitle: "Position Title",
        company: "Company Name", 
        startDate: "Start Date",
        endDate: "End Date",
        responsibilities: [responseMap.get('work_experience_details')]
      }] : [],
      education: responseMap.get('education_background') ? [{
        degree: "Degree",
        field: "Field of Study",
        university: "University Name",
        graduationYear: "Graduation Year"
      }] : [],
      skills: responseMap.get('key_skills') ? 
        String(responseMap.get('key_skills')).split(',').map(s => s.trim()).filter(Boolean) : [],
      achievements: responseMap.get('career_aspirations') ? [responseMap.get('career_aspirations')] : []
    };
  };

  useEffect(() => {
    if (user && currentQuestionIndex === 0 && !answers.fullName) {
      const userEmail = user.email || '';
      setAnswers(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [user, currentQuestionIndex, answers.fullName]);

  useEffect(() => {
    const existingAnswer = answers[currentQuestion?.id] || '';
    setCurrentAnswer(existingAnswer);
  }, [currentQuestionIndex, answers, currentQuestion?.id]);

  useEffect(() => {
    if (mode === 'enhanced' && isVoiceModeEnabled && currentQuestion) {
      speak(currentQuestion.text);
    }
  }, [currentQuestionIndex, mode, isVoiceModeEnabled, speak, currentQuestion]);

  useEffect(() => {
    if (realtimeError) {
      toast({
        title: "Connection Error",
        description: realtimeError,
        variant: "destructive"
      });
    }
  }, [realtimeError, toast]);

  const handleModeSwitch = (newMode: InterviewMode) => {
    const currentMode = mode;
    
    if (currentMode === 'realtime' && isConnected) {
      disconnect();
      setInterviewStarted(false);
    }
    if (currentMode === 'enhanced' && isVoiceModeEnabled) {
      stop();
      setIsVoiceModeEnabled(false);
    }
    onModeChange?.(newMode);
  };

  const handleStartRealtimeInterview = async () => {
    try {
      await connect();
      setInterviewStarted(true);
      toast({
        title: "Interview Started",
        description: "The AI interviewer is ready to speak with you!",
      });
    } catch (err) {
      toast({
        title: "Failed to Start",
        description: "Could not start the interview. Please check your microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const handleEndRealtimeInterview = () => {
    disconnect();
    setInterviewStarted(false);
    
    const processedData = processConversationToUserData(realtimeMessages);
    onComplete(processedData, realtimeMessages);
    
    toast({
      title: "Interview Complete",
      description: "Processing your responses to create summary...",
    });
  };

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

    // Add to transcript for enhanced mode
    if (mode === 'enhanced') {
      setInterviewTranscript(prev => [...prev, {
        question: currentQuestion.text,
        answer: currentAnswer,
        timestamp: new Date().toISOString()
      }]);
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
          email: answers.email || user?.email || '',
          phone: answers.phone || '',
          linkedin: answers.linkedin || ''
        },
        workExperience: parseWorkExperience(answers.workOverview, answers.previousWork),
        education: parseEducation(answers.education),
        skills: parseSkills(answers.skills),
        achievements: parseAchievements(answers.achievements)
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(processedData, mode === 'enhanced' ? 
        interviewTranscript.map(t => ({ role: 'assistant' as const, content: t.question, timestamp: new Date(t.timestamp) })) :
        []
      );
      
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

  const processConversationToUserData = (messages: any[]): UserData => {
    const allUserMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');

    return {
      personalInfo: {
        fullName: extractNameFromText(allUserMessages) || initialData.personalInfo.fullName,
        email: initialData.personalInfo.email,
        phone: extractPhoneFromText(allUserMessages) || initialData.personalInfo.phone,
        linkedin: extractLinkedInFromText(allUserMessages) || initialData.personalInfo.linkedin
      },
      workExperience: [{
        jobTitle: "Position Title",
        company: "Company Name",
        startDate: "Start Date",
        endDate: "End Date",
        responsibilities: [allUserMessages]
      }],
      education: [{
        degree: "Degree",
        field: "Field of Study",
        university: "University Name",
        graduationYear: "Graduation Year"
      }],
      skills: extractSkillsFromText(allUserMessages),
      achievements: extractAchievementsFromText(allUserMessages)
    };
  };

  const extractNameFromText = (text: string): string => {
    const nameMatch = text.match(/(?:I'm|my name is|I am)\s+([A-Za-z]+\s+[A-Za-z]+)/i);
    return nameMatch ? nameMatch[1] : '';
  };

  const extractPhoneFromText = (text: string): string => {
    const phoneMatch = text.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
    return phoneMatch ? phoneMatch[0] : '';
  };

  const extractLinkedInFromText = (text: string): string => {
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    return linkedinMatch ? `https://${linkedinMatch[0]}` : '';
  };

  const extractSkillsFromText = (text: string): string[] => {
    const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'leadership', 'communication'];
    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  };

  const extractAchievementsFromText = (text: string): string[] => {
    const sentences = text.split(/[.!?]+/);
    return sentences.filter(sentence => 
      sentence.toLowerCase().includes('achieved') ||
      sentence.toLowerCase().includes('accomplished') ||
      sentence.toLowerCase().includes('increased') ||
      sentence.toLowerCase().includes('improved')
    ).map(s => s.trim()).filter(Boolean);
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

  // Create separate render functions to avoid type narrowing issues
  const renderModeButtons = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => handleModeSwitch('text')}
        variant={mode === 'text' ? 'default' : 'outline'}
        size="sm"
      >
        Text
      </Button>
      <Button
        onClick={() => handleModeSwitch('enhanced')}
        variant={mode === 'enhanced' ? 'default' : 'outline'}
        size="sm"
      >
        Enhanced
      </Button>
      <Button
        onClick={() => handleModeSwitch('realtime')}
        variant={mode === 'realtime' ? 'default' : 'outline'}
        size="sm"
      >
        Voice
      </Button>
      <Button
        onClick={() => handleModeSwitch('dynamic')}
        variant={mode === 'dynamic' ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-1"
      >
        <Zap className="h-3 w-3" />
        Dynamic
      </Button>
      <Button
        onClick={() => handleModeSwitch('personalized')}
        variant={mode === 'personalized' ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-1"
      >
        <Sparkles className="h-3 w-3" />
        Personalized
      </Button>
    </div>
  );

  const renderRealtimeStartScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4 w-fit mx-auto mb-6">
              <Phone className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              AI Voice Interview
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Have a natural conversation with our AI interviewer to create your resume
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {renderModeButtons()}
          </div>

          <Card className="border-0 shadow-xl mb-8">
            <CardContent className="p-8">
              <div className="space-y-4 text-left">
                <h3 className="font-semibold text-lg mb-4">What to expect:</h3>
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Natural conversation</p>
                    <p className="text-sm text-muted-foreground">Speak naturally about your experience and career</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Voice-powered</p>
                    <p className="text-sm text-muted-foreground">No typing required - just speak your answers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Real-time profile updates</p>
                    <p className="text-sm text-muted-foreground">Your profile hub updates automatically as you speak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleStartRealtimeInterview}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Phone className="h-5 w-5 mr-2" />
            Start Voice Interview
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Make sure your microphone is enabled for the best experience
          </p>
        </div>
      </div>
    </div>
  );

  const renderRealtimeInterview = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Live Interview</h1>
                <p className="text-muted-foreground">Have a natural conversation with our AI</p>
              </div>
            </div>
            
            <Button
              onClick={handleEndRealtimeInterview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Interview
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-gray-400")} />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            
            <Badge variant={isListening ? "default" : "secondary"} className="flex items-center gap-1">
              {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
              {isListening ? "Listening" : "Not Listening"}
            </Badge>
            
            <Badge variant={isSpeaking ? "default" : "secondary"} className="flex items-center gap-1">
              {isSpeaking ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {isSpeaking ? "AI Speaking" : "AI Quiet"}
            </Badge>

            {profileUpdates.totalUpdates > 0 && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3" />
                {profileUpdates.totalUpdates} Profile Updates
              </Badge>
            )}
          </div>

          <InterviewControls
            isListening={isListening}
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onToggleMute={toggleMute}
            onRepeatQuestion={repeatLastQuestion}
            isConnected={isConnected}
          />

          {profileUpdates.lastUpdate && (
            <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Profile Hub Updated!</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileUpdates.lastUpdate.experiences > 0 && (
                    <Badge variant="outline" className="text-xs">{profileUpdates.lastUpdate.experiences} Experience(s)</Badge>
                  )}
                  {profileUpdates.lastUpdate.skills > 0 && (
                    <Badge variant="outline" className="text-xs">{profileUpdates.lastUpdate.skills} Skill(s)</Badge>
                  )}
                  {profileUpdates.lastUpdate.education > 0 && (
                    <Badge variant="outline" className="text-xs">{profileUpdates.lastUpdate.education} Education(s)</Badge>
                  )}
                  {profileUpdates.lastUpdate.projects > 0 && (
                    <Badge variant="outline" className="text-xs">{profileUpdates.lastUpdate.projects} Project(s)</Badge>
                  )}
                  {profileUpdates.lastUpdate.achievements > 0 && (
                    <Badge variant="outline" className="text-xs">{profileUpdates.lastUpdate.achievements} Achievement(s)</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  {realtimeMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <p>The AI interviewer will start the conversation shortly...</p>
                    </div>
                  )}
                  
                  {realtimeMessages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg",
                        message.role === 'user' 
                          ? "bg-blue-50 ml-8" 
                          : "bg-gray-50 mr-8"
                      )}
                    >
                      <div className={cn(
                        "rounded-full p-2 flex-shrink-0",
                        message.role === 'user' 
                          ? "bg-blue-600" 
                          : "bg-gray-600"
                      )}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {message.role === 'user' ? 'You' : 'AI Interviewer'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-foreground">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderTextAndEnhancedMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {mode === 'enhanced' ? 'Enhanced AI Interview' : 'AI Interview'}
              </h1>
              <div className="flex items-center gap-4">
                {renderModeButtons()}
                
                {mode === 'enhanced' && (
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
                )}
              </div>
            </div>
            
            <ProgressBar 
              currentIndex={currentQuestionIndex} 
              totalQuestions={questions.length} 
            />
          </div>

          <Question 
            question={currentQuestion} 
            isPlaying={mode === 'enhanced' && isPlaying} 
          />

          <Answer
            question={currentQuestion}
            answer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
            onEnhance={handleEnhanceAnswer}
            isEnhancing={isEnhancing}
            showEnhanceButton={mode === 'enhanced'}
          />

          {mode === 'enhanced' && !showVoiceChat && (
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

          {mode === 'enhanced' && showVoiceChat && (
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
                  {chatMessages.map((message, index) => (
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

          <Navigation
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoNext={!currentQuestion.required || currentAnswer.trim() !== ''}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );

  // Main render logic - use separate functions to avoid type narrowing
  if (mode === 'realtime') {
    if (!interviewStarted) {
      return renderRealtimeStartScreen();
    }
    return renderRealtimeInterview();
  }

  if (mode === 'dynamic' || mode === 'personalized') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex justify-center">
              {renderModeButtons()}
            </div>
          </div>
        </div>
        <DynamicInterview 
          onComplete={handleDynamicInterviewComplete}
          mode={mode === 'personalized' ? 'personalized' : 'dynamic'}
        />
      </div>
    );
  }

  return renderTextAndEnhancedMode();
};

export default Interview;

}
