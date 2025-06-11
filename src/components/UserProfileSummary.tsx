
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { useNavigate } from 'react-router-dom';

const UserProfileSummary: React.FC = () => {
  const { user } = useAuth();
  const { profileStats } = useProfileData();
  const navigate = useNavigate();

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCompletionLevel = () => {
    if (!profileStats) return 'Beginner';
    const totalItems = profileStats.experienceCount + profileStats.skillsCount + 
                      profileStats.educationCount + profileStats.projectsCount + 
                      profileStats.achievementsCount;
    
    if (totalItems >= 15) return 'Expert';
    if (totalItems >= 8) return 'Advanced';
    if (totalItems >= 3) return 'Intermediate';
    return 'Beginner';
  };

  const calculateCompleteness = () => {
    if (!profileStats) return 0;
    const sections = [
      profileStats.experienceCount > 0 ? 20 : 0,
      profileStats.skillsCount > 0 ? 20 : 0,
      profileStats.educationCount > 0 ? 20 : 0,
      profileStats.projectsCount > 0 ? 20 : 0,
      profileStats.achievementsCount > 0 ? 20 : 0
    ];
    return sections.reduce((sum, val) => sum + val, 0);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getUserInitials(user?.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl text-foreground">
              {user?.user_metadata?.full_name || user?.email || 'Welcome!'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Location not set</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {getCompletionLevel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Professional headline not set
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Career goals not defined
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-md border">
            <div>
              <p className="text-sm font-medium text-foreground">Profile Completeness</p>
              <p className="text-xs text-muted-foreground">{calculateCompleteness()}% complete</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile-hub')}
              className="gap-2"
            >
              Manage Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground p-3 bg-background/50 rounded-md border">
            Complete your profile to get personalized career insights and recommendations. 
            Start with an AI interview to build your professional story.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileSummary;
