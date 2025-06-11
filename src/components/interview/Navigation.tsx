
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  canGoNext,
  isLoading = false
}) => {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  
  return (
    <div className="flex justify-between">
      <Button
        onClick={onPrevious}
        variant="outline"
        disabled={currentIndex === 0}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
      >
        {isLastQuestion ? (
          isLoading ? "Processing..." : "Complete Interview"
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default Navigation;
