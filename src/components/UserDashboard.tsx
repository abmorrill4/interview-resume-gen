
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Briefcase, ArrowRight, Zap, Target, TrendingUp, Cpu, Database, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserDashboardProps {
  onStartInterview: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onStartInterview }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Neural Interview',
      description: 'AI-powered career analysis and profile optimization',
      icon: Brain,
      action: onStartInterview,
      primary: true,
      gradient: 'from-blue-500 to-cyan-400',
      glowColor: 'shadow-blue-500/25'
    },
    {
      title: 'Career Matrix',
      description: 'Manage your professional data ecosystem',
      icon: Briefcase,
      action: () => navigate('/profile'),
      primary: false,
      gradient: 'from-purple-500 to-pink-400',
      glowColor: 'shadow-purple-500/25'
    },
    {
      title: 'Resume Forge',
      description: 'Generate intelligent career documents',
      icon: FileText,
      action: () => console.log('Resume builder coming soon'),
      primary: false,
      gradient: 'from-orange-500 to-red-400',
      glowColor: 'shadow-orange-500/25'
    }
  ];

  const systemStats = [
    { label: 'Neural Patterns', value: '2.4K', icon: Cpu, trend: '+12%' },
    { label: 'Data Points', value: '89', icon: Database, trend: '+24%' },
    { label: 'Career Score', value: '94.2', icon: BarChart3, trend: '+8%' },
  ];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
              Welcome to CareerOS
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered career operating system. Initialize your next career evolution.
            </p>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {systemStats.map((stat, index) => (
              <Card key={stat.label} className="card-futuristic border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend}
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {quickActions.map((action, index) => (
              <Card 
                key={action.title}
                className={`group cursor-pointer transition-all duration-500 hover:scale-105 ${
                  action.primary 
                    ? 'card-futuristic border-primary/50 hover:border-primary glow-primary' 
                    : 'card-futuristic border-border/50 hover:border-primary/50'
                } hover:${action.glowColor} animate-float`}
                style={{ animationDelay: `${index * 0.2}s` }}
                onClick={action.action}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-6 p-4 rounded-xl w-fit bg-gradient-to-r ${action.gradient} relative overflow-hidden`}>
                    <action.icon className="h-8 w-8 text-white relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={action.primary ? "default" : "outline"}
                    className={`w-full group-hover:scale-105 transition-all duration-300 ${
                      action.primary 
                        ? 'btn-cyber' 
                        : 'border-border/50 hover:border-primary/50 hover:bg-primary/10'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                  >
                    {action.primary ? 'Initialize' : 'Access'}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Matrix */}
          <Card className="card-futuristic border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">Activity Matrix</CardTitle>
                  <CardDescription>Your career development timeline</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-lg">No activity data detected.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Run your first Neural Interview to populate the matrix.
                </p>
                <Button 
                  className="btn-cyber mt-6"
                  onClick={onStartInterview}
                >
                  Initialize Neural Scan
                  <Brain className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
