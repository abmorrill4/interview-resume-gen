
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Sparkles } from "lucide-react";

interface QuestionData {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'list';
  category: string;
  required: boolean;
}

interface AnswerProps {
  question: QuestionData;
  answer: string;
  onAnswerChange: (value: string) => void;
  onEnhance?: () => void;
  isEnhancing?: boolean;
  showEnhanceButton?: boolean;
}

const Answer: React.FC<AnswerProps> = ({ 
  question, 
  answer, 
  onAnswerChange, 
  onEnhance,
  isEnhancing = false,
  showEnhanceButton = false
}) => {
  return (
    <Card className="border-0 shadow-xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Your Response
          </div>
          {showEnhanceButton && question.type === 'textarea' && (
            <Button
              onClick={onEnhance}
              disabled={isEnhancing || !answer.trim()}
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
        {question.type === 'textarea' ? (
          <Textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-32 resize-none border-2 focus:border-blue-500"
          />
        ) : (
          <Input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="border-2 focus:border-blue-500"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Answer;
