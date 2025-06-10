
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  onComplete: (data: UserData) => void;
  initialData: UserData;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'list';
  category: keyof UserData;
  required: boolean;
}

const Interview: React.FC<InterviewProps> = ({ onComplete, initialData }) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const questions: Question[] = [
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
    // Initialize current answer with existing data if available
    const existingAnswer = answers[currentQuestion.id] || '';
    setCurrentAnswer(existingAnswer);
  }, [currentQuestionIndex, answers, currentQuestion.id]);

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
      // Process the answers into structured data
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

      // Here you would normally call OpenAI API to enhance the content
      // For now, we'll simulate processing
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
    // Simple parsing - in a real app, you'd use OpenAI to structure this better
    const experiences = [];
    const allText = `${overview} ${previous || ''}`.trim();
    
    if (allText) {
      experiences.push({
        jobTitle: "Position Title", // Would be extracted by AI
        company: "Company Name",
        startDate: "Start Date",
        endDate: "End Date",
        responsibilities: [allText] // Would be broken into bullet points by AI
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
              <h1 className="text-2xl font-bold text-foreground">AI Interview</h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-0 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Interviewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Your Response
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
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
            >
              {isLoading ? (
                "Processing..."
              ) : currentQuestionIndex === questions.length - 1 ? (
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

export default Interview;
