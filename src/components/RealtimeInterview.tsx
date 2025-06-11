import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, User, Bot, Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeInterview } from "@/hooks/useRealtimeInterview";
import { cn } from "@/lib/utils";

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

interface RealtimeInterviewProps {
  onComplete: (data: UserData, messages: any[]) => void;
  initialData: UserData;
}

const RealtimeInterview: React.FC<RealtimeInterviewProps> = ({ onComplete, initialData }) => {
  const { toast } = useToast();
  const {
    isConnected,
    isListening,
    isSpeaking,
    messages,
    connect,
    disconnect,
    error
  } = useRealtimeInterview();
  
  const [interviewStarted, setInterviewStarted] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleStartInterview = async () => {
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

  const handleEndInterview = () => {
    disconnect();
    setInterviewStarted(false);
    
    // Process the conversation and extract resume data
    const processedData = processConversationToUserData(messages);
    
    // Pass both the processed data and the messages to the parent
    onComplete(processedData, messages);
    
    toast({
      title: "Interview Complete",
      description: "Processing your responses to create summary...",
    });
  };

  const processConversationToUserData = (messages: any[]): UserData => {
    // This is a simplified processing function
    // In a real implementation, you'd use AI to extract structured data
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
    // Simple regex to find "I'm [Name]" or "My name is [Name]"
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
    // Simple extraction - in practice, you'd use AI
    const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'leadership', 'communication'];
    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  };

  const extractAchievementsFromText = (text: string): string[] => {
    // Extract sentences that mention achievements
    const sentences = text.split(/[.!?]+/);
    return sentences.filter(sentence => 
      sentence.toLowerCase().includes('achieved') ||
      sentence.toLowerCase().includes('accomplished') ||
      sentence.toLowerCase().includes('increased') ||
      sentence.toLowerCase().includes('improved')
    ).map(s => s.trim()).filter(Boolean);
  };

  if (!interviewStarted) {
    return (
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
                    <Volume2 className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Real-time feedback</p>
                      <p className="text-sm text-muted-foreground">Get immediate responses and follow-up questions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleStartInterview}
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
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
              onClick={handleEndInterview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Interview
            </Button>
          </div>

          {/* Status Indicators */}
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
          </div>

          {/* Conversation Display */}
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
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <p>The AI interviewer will start the conversation shortly...</p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
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

          {/* Instructions */}
          <Card className="border-0 shadow-lg mt-6">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">
                  💡 <strong>Tip:</strong> Speak naturally about your experience, skills, and achievements
                </p>
                <p>
                  The AI will ask follow-up questions to help create your perfect resume
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealtimeInterview;

}
