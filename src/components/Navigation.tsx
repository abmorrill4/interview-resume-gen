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
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-cyber rounded-xl p-2.5 glow-primary">
                <Cpu className="h-7 w-7 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-cyber rounded-xl animate-pulse-glow opacity-50"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent text-neon">
                CareerOS
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                AI-POWERED CAREER PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="flex items-center gap-2 hover:bg-accent/50 hover:text-primary transition-all duration-300"
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
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hover:bg-accent/50 transition-all duration-300"
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
                  <span className="hidden md:inline font-medium">{user.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-border/50 hover:border-primary/50 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                className="btn-cyber"
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
