
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useToast } from "@/hooks/use-toast";
import { DynamicInterviewService } from "@/services/DynamicInterviewService";
import { DynamicQuestion as QuestionType, InterviewResponse, UserProfile } from "@/types/InterviewTypes";
import DynamicQuestion from "./interview/DynamicQuestion";

interface DynamicInterviewProps {
  onComplete: (responses: InterviewResponse[]) => void;
  mode?: 'dynamic' | 'personalized';
}

const DynamicInterview: React.FC<DynamicInterviewProps> = ({
  onComplete,
  mode = 'dynamic'
}) => {
  const { user } = useAuth();
  const { profileStats } = useProfileData();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(null);
  const [currentValue, setCurrentValue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);

  useEffect(() => {
    initializeInterview();
  }, [profileStats, mode]);

  const initializeInterview = () => {
    setIsLoading(true);
    
    const userProfile: UserProfile = {
      hasWorkExperience: (profileStats?.experienceCount || 0) > 0,
      experienceYears: 0, // This could be calculated from experience data
      skillsCount: profileStats?.skillsCount || 0,
      educationLevel: (profileStats?.educationCount || 0) > 0 ? 'college' : 'high_school',
      careerGoals: undefined // This could come from user data
    };

    const interviewQuestions = mode === 'personalized' 
      ? DynamicInterviewService.getPersonalizedQuestions(userProfile)
      : DynamicInterviewService.getBaseQuestions();

    setQuestions(interviewQuestions);
    
    const firstQuestion = DynamicInterviewService.getNextQuestion(interviewQuestions, []);
    setCurrentQuestion(firstQuestion);
    setCurrentValue(null);
    setIsLoading(false);

    if (firstQuestion) {
      setQuestionHistory([firstQuestion.id]);
    }
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    // Validate required questions
    if (currentQuestion.required && !hasValidValue(currentValue)) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Save response
    const newResponse: InterviewResponse = {
      questionId: currentQuestion.id,
      value: currentValue,
      timestamp: new Date()
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Check for follow-up questions
    const followUpIds = DynamicInterviewService.getFollowUpQuestions(updatedResponses, questions);
    
    // Add follow-up questions to the questions list if they're not already there
    const newQuestions = [...questions];
    followUpIds.forEach(id => {
      if (!newQuestions.find(q => q.id === id)) {
        // You could define follow-up questions here or fetch them dynamically
        console.log(`Follow-up question needed: ${id}`);
      }
    });

    // Get next question
    const nextQuestion = DynamicInterviewService.getNextQuestion(newQuestions, updatedResponses);
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setCurrentValue(null);
      setQuestionHistory(prev => [...prev, nextQuestion.id]);
    } else {
      // Interview complete
      completeInterview(updatedResponses);
    }
  };

  const handlePrevious = () => {
    if (questionHistory.length <= 1) return;

    // Remove last question from history
    const newHistory = questionHistory.slice(0, -1);
    setQuestionHistory(newHistory);

    // Get previous question
    const previousQuestionId = newHistory[newHistory.length - 1];
    const previousQuestion = questions.find(q => q.id === previousQuestionId);
    
    if (previousQuestion) {
      setCurrentQuestion(previousQuestion);
      
      // Remove the response for current question and restore previous value
      const filteredResponses = responses.filter(r => r.questionId !== currentQuestion?.id);
      setResponses(filteredResponses);
      
      const previousResponse = filteredResponses.find(r => r.questionId === previousQuestionId);
      setCurrentValue(previousResponse?.value || null);
    }
  };

  const completeInterview = (finalResponses: InterviewResponse[]) => {
    toast({
      title: "Interview Complete!",
      description: "Processing your responses to update your profile...",
    });
    
    onComplete(finalResponses);
  };

  const hasValidValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  const currentQuestionIndex = questionHistory.length;
  const totalQuestions = questions.filter(q => {
    if (!q.condition) return true;
    const conditionResponse = responses.find(r => r.questionId === q.condition!.questionId);
    return conditionResponse && DynamicInterviewService['evaluateCondition'](q.condition, conditionResponse.value);
  }).length;
  
  const progress = DynamicInterviewService.calculateProgress(totalQuestions, responses.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing your personalized interview...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-muted-foreground">Thank you for your responses. We're processing your information now.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                {mode === 'personalized' ? 'Personalized' : 'Dynamic'} AI Interview
              </h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Adaptive
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <DynamicQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={setCurrentValue}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={!currentQuestion.required || hasValidValue(currentValue)}
            canGoPrevious={questionHistory.length > 1}
            isLast={currentQuestionIndex >= totalQuestions}
            questionNumber={currentQuestionIndex}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicInterview;
