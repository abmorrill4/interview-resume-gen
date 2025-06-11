
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquare, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TargetedInterviewTriggerProps {
  contextType: 'experience_deep_dive' | 'skills_assessment';
  contextData: any;
  title: string;
  description: string;
}

const TargetedInterviewTrigger: React.FC<TargetedInterviewTriggerProps> = ({
  contextType,
  contextData,
  title,
  description
}) => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    // Navigate to interview page with context parameters
    navigate('/interview', {
      state: {
        contextType,
        contextData,
        mode: 'targeted'
      }
    });
  };

  const getContextLabel = () => {
    switch (contextType) {
      case 'experience_deep_dive':
        return 'Experience Focus';
      case 'skills_assessment':
        return 'Skills Validation';
      default:
        return 'Targeted Interview';
    }
  };

  const getContextIcon = () => {
    switch (contextType) {
      case 'experience_deep_dive':
        return <Target className="h-4 w-4" />;
      case 'skills_assessment':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          {getContextIcon()}
          Expand with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Targeted AI Interview
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                {getContextIcon()}
                {getContextLabel()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
            
            <div className="bg-background/50 rounded-lg p-3 border">
              <h4 className="font-medium text-sm mb-2">What to expect:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• AI-guided questions specific to this content</li>
                <li>• 5-10 minutes of focused conversation</li>
                <li>• Your responses will enhance your profile</li>
                <li>• Real-time voice or text interaction</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleStartInterview}
              className="w-full flex items-center gap-2"
            >
              Start Targeted Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default TargetedInterviewTrigger;
