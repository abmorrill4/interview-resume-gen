
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Award, Code, User, FileText, TrendingUp } from 'lucide-react';
import ExperiencePage from '@/components/profile/ExperiencePage';
import SkillsPage from '@/components/profile/SkillsPage';
import EducationPage from '@/components/profile/EducationPage';
import ProjectsPage from '@/components/profile/ProjectsPage';
import AchievementsPage from '@/components/profile/AchievementsPage';
import DocumentsPage from '@/components/profile/DocumentsPage';

const ProfileHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileStats, fetchProfileStats } = useProfileData();
  const [activeSection, setActiveSection] = useState('overview');
  
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

  const sidebarItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: TrendingUp,
      color: 'text-slate-600'
    },
    {
      id: 'experience',
      title: 'Experience',
      icon: Briefcase,
      color: 'text-blue-600',
      count: profileStats?.experienceCount || 0
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: Code,
      color: 'text-green-600',
      count: profileStats?.skillsCount || 0
    },
    {
      id: 'education',
      title: 'Education',
      icon: GraduationCap,
      color: 'text-purple-600',
      count: profileStats?.educationCount || 0
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: User,
      color: 'text-orange-600',
      count: profileStats?.projectsCount || 0
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: Award,
      color: 'text-red-600',
      count: profileStats?.achievementsCount || 0
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: FileText,
      color: 'text-indigo-600'
    }
  ];

  const ProfileSidebar = () => (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-6 border-b border-border/40">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Profile Hub</h2>
            <p className="text-sm text-muted-foreground">Manage your professional profile</p>
          </div>
          
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completeness</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {calculateCompleteness()}%
                  </Badge>
                </div>
                <Progress value={calculateCompleteness()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Complete your profile for better insights
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                isActive={activeSection === item.id}
                className="w-full justify-start gap-3 py-3 px-3 rounded-lg transition-colors"
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-sm font-medium">{item.title}</span>
                {item.count !== undefined && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.count}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );

  const OverviewSection = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-xl text-muted-foreground">
          Track your profile progress and manage your professional data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sidebarItems.slice(1, -1).map((item) => (
          <Card 
            key={item.id} 
            className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm hover:shadow-lg"
            onClick={() => setActiveSection(item.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-background border`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.count !== undefined 
                      ? `${item.count} ${item.count === 1 ? 'item' : 'items'}`
                      : 'Manage your data'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <p className="text-sm text-muted-foreground">Your profile at a glance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{profileStats?.experienceCount || 0}</div>
                <div className="text-xs text-muted-foreground">Experience</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{profileStats?.skillsCount || 0}</div>
                <div className="text-xs text-muted-foreground">Skills</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{profileStats?.educationCount || 0}</div>
                <div className="text-xs text-muted-foreground">Education</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{profileStats?.projectsCount || 0}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{profileStats?.achievementsCount || 0}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'experience':
        return <ExperiencePage />;
      case 'skills':
        return <SkillsPage />;
      case 'education':
        return <EducationPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'documents':
        return <DocumentsPage />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <ProfileSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 items-center gap-4 border-b border-border/40 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold capitalize">{activeSection}</h2>
              </div>
            </div>
            <main className="flex-1 p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {renderActiveSection()}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProfileHub;
