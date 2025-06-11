
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserDashboardProps {
  onStartInterview: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onStartInterview }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'AI Interview',
      description: 'Start an AI-powered interview to update your profile',
      icon: Brain,
      action: onStartInterview,
      primary: true
    },
    {
      title: 'Profile Hub',
      description: 'Manage your professional information',
      icon: Briefcase,
      action: () => navigate('/profile'),
      primary: false
    },
    {
      title: 'Resume Builder',
      description: 'Generate professional resumes',
      icon: FileText,
      action: () => console.log('Resume builder coming soon'),
      primary: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">What would you like to work on today?</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card 
              key={action.title}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                action.primary ? 'border-primary shadow-sm' : ''
              }`}
              onClick={action.action}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 p-3 rounded-lg w-fit ${
                  action.primary 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant={action.primary ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  {action.primary ? 'Start Now' : 'Open'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>No recent activity yet.</p>
                <p className="text-sm mt-1">Start your first AI interview to get started!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
