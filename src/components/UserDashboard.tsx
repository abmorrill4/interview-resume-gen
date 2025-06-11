
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { Container, Stack, Grid } from "@/components/ui/design-system";
import WelcomeHeader from "./dashboard/WelcomeHeader";
import SystemStats from "./dashboard/SystemStats";
import QuickActions from "./dashboard/QuickActions";
import ActivitySection from "./dashboard/ActivitySection";
import UserProfileSummary from "./UserProfileSummary";
import InterviewProgress from "./InterviewProgress";
import CareerInsights from "./CareerInsights";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profileStats, fetchProfileStats } = useProfileData();
  const { documents, fetchDocuments } = useDocumentUpload();

  useEffect(() => {
    if (user) {
      fetchProfileStats();
      fetchDocuments();
    }
  }, [user, fetchProfileStats, fetchDocuments]);

  // Check if user is new (has no profile data or documents)
  const hasDocuments = documents.length > 0;
  const hasProfileData = profileStats && (
    profileStats.experienceCount > 0 || 
    profileStats.skillsCount > 0 || 
    profileStats.educationCount > 0 || 
    profileStats.projectsCount > 0 || 
    profileStats.achievementsCount > 0
  );

  const isNewUser = !hasDocuments && !hasProfileData;

  return (
    <div className="min-h-screen bg-background">
      <Container maxWidth="7xl" padding="xl">
        <Stack gap="6xl">
          {/* Welcome Section */}
          <WelcomeHeader />

          {/* Main Dashboard Grid */}
          <Grid responsive={{ lg: 2, xl: 3 }} gap="xl">
            {/* Left Column - Profile and Progress */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile Summary */}
              <div className="fade-in-up profile-summary">
                <UserProfileSummary />
              </div>
              
              {/* Interview Progress */}
              <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                <InterviewProgress />
              </div>
              
              {/* System Stats */}
              <SystemStats />
            </div>

            {/* Right Column - Career Insights */}
            <Stack gap="xl">
              <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
                <CareerInsights />
              </div>
            </Stack>
          </Grid>

          {/* Quick Actions Grid */}
          <QuickActions />

          {/* Onboarding or Activity Section */}
          <div className="fade-in-up" style={{ animationDelay: '1.2s' }}>
            <ActivitySection 
              isNewUser={isNewUser}
              hasDocuments={hasDocuments}
              hasProfileData={!!hasProfileData}
            />
          </div>
        </Stack>
      </Container>
    </div>
  );
};

export default UserDashboard;
