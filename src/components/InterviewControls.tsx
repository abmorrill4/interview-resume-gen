
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, MicOff, Mic, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface InterviewControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRepeatQuestion: () => void;
  isConnected: boolean;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  isListening,
  isSpeaking,
  isMuted,
  isPaused,
  onTogglePause,
  onToggleMute,
  onRepeatQuestion,
  isConnected
}) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-3">
          {/* Pause/Resume Control */}
          <Button
            onClick={onTogglePause}
            disabled={!isConnected}
            variant={isPaused ? "default" : "outline"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isPaused ? (
              <>
                <Play className="h-5 w-5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            )}
          </Button>

          {/* Mute/Unmute Control */}
          <Button
            onClick={onToggleMute}
            disabled={!isConnected}
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isMuted ? (
              <>
                <VolumeX className="h-5 w-5" />
                Unmute AI
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" />
                Mute AI
              </>
            )}
          </Button>

          {/* Repeat Question Control */}
          <Button
            onClick={onRepeatQuestion}
            disabled={!isConnected || isPaused}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Repeat Question
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className={`flex items-center gap-1 ${isListening ? 'text-green-600' : ''}`}>
            <Mic className="h-4 w-4" />
            {isListening ? 'Listening...' : 'Not listening'}
          </div>
          <div className={`flex items-center gap-1 ${isSpeaking ? 'text-blue-600' : ''}`}>
            <Volume2 className="h-4 w-4" />
            {isSpeaking ? 'AI Speaking...' : 'AI Silent'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewControls;
