
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, Bot, FileText, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InterviewSummaryProps {
  messages: Message[];
  onStartOver: () => void;
}

interface AISummary {
  narrativeSummary: string;
  keyChanges: {
    new: string[];
    updated: string[];
    unchanged: string[];
  };
}

const InterviewSummary: React.FC<InterviewSummaryProps> = ({ messages, onStartOver }) => {
  const { toast } = useToast();
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAISummary();
  }, [messages]);

  const generateAISummary = async () => {
    try {
      setLoading(true);
      
      // Prepare the transcript for AI analysis
      const transcript = messages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'AI Interviewer'}: ${msg.content}`
      ).join('\n\n');

      const { data, error } = await supabase.functions.invoke('enhance-content', {
        body: {
          prompt: `Analyze this interview transcript and provide:
          
1. A narrative summary of the candidate's background, experience, and key achievements
2. Categorize information as:
   - NEW: Information that appears to be recently acquired skills, experiences, or achievements
   - UPDATED: Information that builds upon or updates previous experience
   - UNCHANGED: Core background information that seems established

Transcript:
${transcript}

Please respond in JSON format with this structure:
{
  "narrativeSummary": "A comprehensive narrative summary...",
  "keyChanges": {
    "new": ["List of new items"],
    "updated": ["List of updated items"], 
    "unchanged": ["List of unchanged/core items"]
  }
}`
        }
      });

      if (error) throw error;

      try {
        const parsedSummary = JSON.parse(data.enhancedContent);
        setAiSummary(parsedSummary);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        setAiSummary({
          narrativeSummary: data.enhancedContent,
          keyChanges: {
            new: ["Unable to categorize - see narrative summary"],
            updated: [],
            unchanged: []
          }
        });
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: "Summary Generation Failed",
        description: "Could not generate AI summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Interview Summary</h1>
                <p className="text-muted-foreground">Review your interview transcript and AI-generated insights</p>
              </div>
            </div>
            
            <Button
              onClick={onStartOver}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Start New Interview
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Full Transcript */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Full Interview Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No conversation data available</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg",
                            message.role === 'user' 
                              ? "bg-blue-50 ml-4" 
                              : "bg-gray-50 mr-4"
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
                            <p className="text-foreground text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <div className="space-y-6">
              {/* Narrative Summary */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Narrative Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Generating AI summary...</span>
                    </div>
                  ) : aiSummary ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed">{aiSummary.narrativeSummary}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Unable to generate summary</p>
                  )}
                </CardContent>
              </Card>

              {/* Key Changes Analysis */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Profile Changes Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : aiSummary ? (
                    <div className="space-y-4">
                      {/* New Information */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            New
                          </Badge>
                          <span className="text-sm font-medium">Recently Acquired</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          {aiSummary.keyChanges.new.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Updated Information */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Updated
                          </Badge>
                          <span className="text-sm font-medium">Enhanced Experience</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          {aiSummary.keyChanges.updated.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Core Information */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-gray-100 text-gray-800">
                            Core
                          </Badge>
                          <span className="text-sm font-medium">Established Background</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          {aiSummary.keyChanges.unchanged.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-gray-600 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Unable to analyze changes</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSummary;
