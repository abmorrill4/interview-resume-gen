import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Brain, FileText, Briefcase, Moon, Sun, Cpu } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Cpu,
      onClick: () => navigate('/dashboard'),
      description: 'Main dashboard'
    },
    {
      label: 'AI Interview',
      icon: Brain,
      onClick: () => navigate('/interview'),
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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-primary rounded-lg p-2">
              <Cpu className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-primary">
                CareerOS
              </span>
              <span className="text-xs text-muted-foreground">
                AI Career Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="flex items-center gap-2 text-sm"
                onClick={item.onClick}
                asChild={!!item.href}
              >
                {item.href ? (
                  <a href={item.href} className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              <>
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
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                className="btn-primary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
