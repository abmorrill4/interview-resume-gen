
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, GitBranch, Zap, Brain, TrendingUp, Users } from "lucide-react";

interface GraphShowcaseProps {
  onStartInterview: () => void;
}

const GraphShowcase: React.FC<GraphShowcaseProps> = ({ onStartInterview }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-4">
            <Network className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Professional Knowledge Graph
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your resume into an intelligent knowledge graph that reveals hidden connections, 
          suggests career opportunities, and provides AI-powered professional insights.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center pb-4">
            <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
              <GitBranch className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Relationship Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Automatically extract and visualize relationships between companies, skills, 
              education, and professional experiences from your resume data.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center pb-4">
            <div className="bg-indigo-100 rounded-full p-3 w-fit mx-auto mb-4">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Get intelligent suggestions for potential connections, skill gaps, 
              and career opportunities based on your professional graph analysis.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center pb-4">
            <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Career Pathways</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Discover optimal career paths and identify strategic skills to develop 
              based on your current professional network and industry trends.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center pb-4">
            <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Network Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Analyze your professional network strength, identify key connections, 
              and find opportunities to expand your influence in your industry.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center pb-4">
            <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-4">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Real-time Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Your knowledge graph evolves with your career, automatically updating 
              relationships and insights as you add new experiences and skills.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center pb-4">
            <div className="bg-teal-100 rounded-full p-3 w-fit mx-auto mb-4">
              <Network className="h-6 w-6 text-teal-600" />
            </div>
            <CardTitle className="text-lg">Interactive Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Explore your professional world through interactive graph visualizations 
              that make complex relationships easy to understand and navigate.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="text-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Ready to Map Your Professional Journey?</h3>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Start your AI-enhanced interview to create your personalized knowledge graph 
          and unlock insights about your career potential.
        </p>
        <Button 
          onClick={onStartInterview}
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Begin Knowledge Graph Creation
        </Button>
      </div>
    </div>
  );
};

export default GraphShowcase;
