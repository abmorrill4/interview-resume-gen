
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Briefcase, BarChart3, Users, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleShowcaseProps {
  onStartInterview: () => void;
}

const ModuleShowcase: React.FC<ModuleShowcaseProps> = ({ onStartInterview }) => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'interview',
      title: 'AI Interview Module',
      description: 'Conduct intelligent, voice-powered interviews that extract your professional experience and automatically update your profile in real-time.',
      icon: Brain,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Voice-powered AI conversations',
        'Real-time profile updates',
        'Intelligent question flow',
        'Professional insights generation'
      ],
      action: {
        label: 'Start Interview',
        onClick: onStartInterview
      }
    },
    {
      id: 'profile',
      title: 'Profile Hub',
      description: 'Centralized dashboard to manage your professional data, track career progression, and maintain comprehensive profiles across all domains.',
      icon: Briefcase,
      gradient: 'from-indigo-500 to-purple-500',
      features: [
        'Experience management',
        'Skills tracking',
        'Education records',
        'Project portfolio',
        'Achievement showcase'
      ],
      action: {
        label: 'Open Profile Hub',
        onClick: () => navigate('/profile')
      }
    },
    {
      id: 'resume',
      title: 'Resume Builder',
      description: 'Generate professional, ATS-optimized resumes from your profile data with intelligent formatting and industry-specific templates.',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Auto-generated from profile',
        'Multiple template options',
        'ATS optimization',
        'Export to multiple formats'
      ],
      action: {
        label: 'Build Resume',
        href: '#resume-builder'
      }
    },
    {
      id: 'analytics',
      title: 'Career Analytics',
      description: 'Advanced insights into your career trajectory, skill gaps, market positioning, and personalized recommendations for growth.',
      icon: BarChart3,
      gradient: 'from-green-500 to-teal-500',
      features: [
        'Career progression analysis',
        'Skill gap identification',
        'Market positioning insights',
        'Growth recommendations'
      ],
      action: {
        label: 'View Analytics',
        href: '#analytics'
      }
    }
  ];

  return (
    <section id="modules" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Comprehensive Career Platform
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to advance your career, powered by artificial intelligence 
            and designed for the modern professional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module, index) => (
            <Card 
              key={module.id} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-r ${module.gradient} rounded-lg p-3`}>
                    <module.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                    Module {index + 1}
                  </span>
                </div>
                <CardTitle className="text-2xl mb-3">{module.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {module.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="space-y-3 mb-6">
                  {module.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={module.action.onClick}
                  className={`w-full bg-gradient-to-r ${module.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg`}
                  asChild={!!module.action.href}
                >
                  {module.action.href ? (
                    <a href={module.action.href} className="flex items-center justify-center gap-2">
                      {module.action.label}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </a>
                  ) : (
                    <>
                      {module.action.label}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional features section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-8">Why Choose Our Platform?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Lightning Fast</h4>
              <p className="text-sm text-muted-foreground">
                Real-time processing and instant profile updates during interviews
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="font-semibold mb-2">AI-Powered</h4>
              <p className="text-sm text-muted-foreground">
                Advanced AI that understands your career context and provides insights
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Professional</h4>
              <p className="text-sm text-muted-foreground">
                Designed by career experts for modern professionals
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModuleShowcase;
