
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Brain, FileText, Briefcase } from "lucide-react";

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigationItems = [
    {
      label: 'AI Interview',
      icon: Brain,
      href: '#interview',
      description: 'Start AI-powered interview'
    },
    {
      label: 'Profile Hub',
      icon: Briefcase,
      onClick: () => navigate('/profile'),
      description: 'Manage your profile'
    },
    {
      label: 'Resume Builder',
      icon: FileText,
      href: '#resume',
      description: 'Create and manage resumes'
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Resume Platform
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="flex items-center gap-2 hover:bg-blue-50"
                onClick={item.onClick}
                asChild={!!item.href}
              >
                {item.href ? (
                  <a href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </a>
                ) : (
                  <>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </>
                )}
              </Button>
            ))}
          </div>

          {/* User Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span className="hidden md:inline">{user.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
