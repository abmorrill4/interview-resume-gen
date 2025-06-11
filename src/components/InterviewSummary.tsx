
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Brain, User, RotateCcw, Eye, ArrowRight } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InterviewSummaryProps {
  messages: Message[];
  onStartOver: () => void;
  onViewProfile?: () => void;
}

const InterviewSummary: React.FC<InterviewSummaryProps> = ({ 
  messages, 
  onStartOver, 
  onViewProfile 
}) => {
  const userMessages = messages.filter(m => m.role === 'user');
  const aiMessages = messages.filter(m => m.role === 'assistant');
  
  const estimatedTopics = [
    'Work Experience',
    'Technical Skills', 
    'Educational Background',
    'Career Goals',
    'Professional Achievements'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Interview Complete!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your profile has been updated with information from your interview
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{userMessages.length}</div>
                <p className="text-sm text-muted-foreground">Your Responses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{aiMessages.length}</div>
                <p className="text-sm text-muted-foreground">AI Questions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{estimatedTopics.length}</div>
                <p className="text-sm text-muted-foreground">Topics Covered</p>
              </CardContent>
            </Card>
          </div>

          {/* Topics Covered */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Topics Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {estimatedTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Interview Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        message.role === 'user' 
                          ? "bg-blue-50 ml-8" 
                          : "bg-gray-50 mr-8"
                      }`}
                    >
                      <div className={`rounded-full p-2 flex-shrink-0 ${
                        message.role === 'user' 
                          ? "bg-blue-600" 
                          : "bg-gray-600"
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Brain className="h-4 w-4 text-white" />
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onViewProfile && (
              <Button 
                onClick={onViewProfile}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Updated Profile
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            )}
            <Button 
              onClick={onStartOver}
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Your profile has been automatically updated with interview insights
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Review and refine your profile in the Profile Hub
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Generate a professional resume when you're ready
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSummary;
