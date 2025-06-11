
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface QuestionData {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'list';
  category: string;
  required: boolean;
}

interface QuestionProps {
  question: QuestionData;
  isPlaying?: boolean;
}

const Question: React.FC<QuestionProps> = ({ question, isPlaying = false }) => {
  return (
    <Card className="border-0 shadow-xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Interviewer
          {isPlaying && <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{question.text}</p>
      </CardContent>
    </Card>
  );
};

export default Question;
