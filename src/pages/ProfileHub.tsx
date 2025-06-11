
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, GraduationCap, Award, Code, User, Brain, FolderOpen, Trophy, FileText } from 'lucide-react';
import ExperiencePage from '@/components/profile/ExperiencePage';
import SkillsPage from '@/components/profile/SkillsPage';
import EducationPage from '@/components/profile/EducationPage';
import ProjectsPage from '@/components/profile/ProjectsPage';
import AchievementsPage from '@/components/profile/AchievementsPage';
import DocumentsPage from '@/components/profile/DocumentsPage';
import ProfileSnapshot from '@/components/ProfileSnapshot';
import { useProfileData } from '@/hooks/useProfileData';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProfileHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileStats, fetchProfileStats } = useProfileData();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfileStats();
  }, [user, navigate, fetchProfileStats]);

  if (!user) {
    return null;
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Profile Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Manage your professional profile and career data
            </p>
            
            {/* Profile Completeness */}
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Profile Completeness</h3>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {calculateCompleteness()}%
                  </Badge>
                </div>
                <Progress value={calculateCompleteness()} className="h-3 mb-4" />
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">{profileStats?.experienceCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Experiences</p>
                  </div>
                  <div className="text-center">
                    <Code className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">{profileStats?.skillsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Skills</p>
                  </div>
                  <div className="text-center">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium">{profileStats?.educationCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Education</p>
                  </div>
                  <div className="text-center">
                    <User className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="font-medium">{profileStats?.projectsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <p className="font-medium">{profileStats?.achievementsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Sections */}
          <Tabs defaultValue="experience" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="experience" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="experience">
              <ExperiencePage />
            </TabsContent>
            
            <TabsContent value="skills">
              <SkillsPage />
            </TabsContent>
            
            <TabsContent value="education">
              <EducationPage />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProjectsPage />
            </TabsContent>
            
            <TabsContent value="achievements">
              <AchievementsPage />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentsPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileHub;
