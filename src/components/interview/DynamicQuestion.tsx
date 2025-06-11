
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bot, Star } from "lucide-react";
import { DynamicQuestion as QuestionType, InterviewResponse } from '@/types/InterviewTypes';

interface DynamicQuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLast: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const DynamicQuestion: React.FC<DynamicQuestionProps> = ({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLast,
  questionNumber,
  totalQuestions
}) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className="border-2 focus:border-primary"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-32 resize-none border-2 focus:border-primary"
          />
        );

      case 'multiple_choice':
        if (question.allowMultiple) {
          return (
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        onChange([...currentValues, option.value]);
                      } else {
                        onChange(currentValues.filter((v: string) => v !== option.value));
                      }
                    }}
                  />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          );
        } else {
          return (
            <RadioGroup value={value || ''} onValueChange={onChange}>
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        }

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.scale.labels?.min}</span>
              <span>{question.scale.labels?.max}</span>
            </div>
            <div className="flex justify-between items-center">
              {Array.from({ length: question.scale.max - question.scale.min + 1 }, (_, i) => {
                const ratingValue = question.scale.min + i;
                return (
                  <Button
                    key={ratingValue}
                    variant={value === ratingValue ? "default" : "outline"}
                    size="sm"
                    className="w-12 h-12 rounded-full"
                    onClick={() => onChange(ratingValue)}
                  >
                    {ratingValue}
                  </Button>
                );
              })}
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      value && i < Math.floor((value - question.scale.min) / 2) + 1
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Interviewer
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed mb-6">{question.text}</p>
          {renderQuestionInput()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          Previous
        </Button>

        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2"
        >
          {isLast ? 'Complete Interview' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default DynamicQuestion;
