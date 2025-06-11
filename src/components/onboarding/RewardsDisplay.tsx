
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Trophy, Star, Zap, Award, Gift } from 'lucide-react';

export const RewardsDisplay: React.FC = () => {
  const { steps, completedRewards } = useOnboarding();

  const allRewards = steps
    .filter(step => step.reward)
    .map(step => ({
      ...step.reward!,
      stepId: step.id,
      stepTitle: step.title,
      earned: completedRewards.includes(step.reward!.value)
    }));

  const earnedRewards = allRewards.filter(reward => reward.earned);
  
  if (earnedRewards.length === 0) return null;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award className="h-5 w-5" />;
      case 'points': return <Star className="h-5 w-5" />;
      case 'feature': return <Zap className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'badge': return 'bg-purple-600';
      case 'points': return 'bg-yellow-600';
      case 'feature': return 'bg-blue-600';
      default: return 'bg-green-600';
    }
  };

  const totalPoints = earnedRewards
    .filter(reward => reward.type === 'points')
    .reduce((sum, reward) => sum + parseInt(reward.value), 0);

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-full">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-amber-800">Your Achievements</CardTitle>
            <p className="text-sm text-amber-600">
              Rewards earned from completing onboarding tutorials
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {earnedRewards.map((reward, index) => (
            <div 
              key={reward.value}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200"
            >
              <div className={`p-2 rounded-full text-white ${getRewardColor(reward.type)}`}>
                {getRewardIcon(reward.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {reward.description}
                </p>
                <p className="text-xs text-gray-500">
                  From: {reward.stepTitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {totalPoints > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-6 w-6 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-800">
                Total Career Points: {totalPoints}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
