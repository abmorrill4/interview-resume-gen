
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp } from "lucide-react";

interface LandingHeroProps {
  onStartInterview: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onStartInterview }) => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-purple-200/30 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            AI-Powered Career Development Platform
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Transform Your Career
            </span>
            <br />
            <span className="text-gray-900">With AI Intelligence</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of career development with AI-powered interviews, 
            intelligent profile management, and professional insights that adapt to your journey.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">AI-Driven</div>
              <div className="text-sm text-muted-foreground">Interview Process</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">Real-time</div>
              <div className="text-sm text-muted-foreground">Profile Updates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">Smart</div>
              <div className="text-sm text-muted-foreground">Career Insights</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onStartInterview}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
            >
              <Brain className="h-5 w-5 mr-2" />
              Start AI Interview
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-blue-200 hover:border-blue-300 px-8 py-4 text-lg font-semibold rounded-lg min-w-[200px]"
              asChild
            >
              <a href="#modules">
                <TrendingUp className="h-5 w-5 mr-2" />
                Explore Features
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="text-sm text-muted-foreground mt-8">
            Join thousands of professionals accelerating their careers with AI
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
