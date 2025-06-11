
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Code, GraduationCap, User, Award, TrendingUp } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';

interface ProfileSnapshotProps {
  className?: string;
  isCompact?: boolean;
}

const ProfileSnapshot: React.FC<ProfileSnapshotProps> = ({ className = '', isCompact = false }) => {
  const { profileStats } = useProfileData();

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

  const statItems = [
    {
      icon: Briefcase,
      label: 'Experience',
      count: profileStats?.experienceCount || 0,
      color: 'text-blue-600',
      id: 'experience-counter'
    },
    {
      icon: Code,
      label: 'Skills',
      count: profileStats?.skillsCount || 0,
      color: 'text-green-600',
      id: 'skills-counter'
    },
    {
      icon: GraduationCap,
      label: 'Education',
      count: profileStats?.educationCount || 0,
      color: 'text-purple-600',
      id: 'education-counter'
    },
    {
      icon: User,
      label: 'Projects',
      count: profileStats?.projectsCount || 0,
      color: 'text-orange-600',
      id: 'projects-counter'
    },
    {
      icon: Award,
      label: 'Achievements',
      count: profileStats?.achievementsCount || 0,
      color: 'text-red-600',
      id: 'achievements-counter'
    }
  ];

  if (isCompact) {
    return (
      <Card className={`border-0 shadow-lg ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Profile</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {calculateCompleteness()}%
            </Badge>
          </div>
          <Progress value={calculateCompleteness()} className="h-2 mb-3" />
          <div className="grid grid-cols-5 gap-1">
            {statItems.map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className={`h-3 w-3 mx-auto mb-1 ${item.color}`} />
                <p className="text-xs font-medium" id={item.id}>{item.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Profile Completeness</h3>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {calculateCompleteness()}%
          </Badge>
        </div>
        <Progress value={calculateCompleteness()} className="h-3 mb-6" />
        <div className="space-y-3">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <Badge variant="outline" id={item.id}>
                {item.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSnapshot;
