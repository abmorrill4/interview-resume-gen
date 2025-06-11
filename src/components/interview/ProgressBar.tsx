
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentIndex, totalQuestions }) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ProgressBar;
