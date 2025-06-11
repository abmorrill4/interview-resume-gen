
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGraphDatabase } from '@/hooks/useGraphDatabase';
import { Network, Building2, GraduationCap, User, Lightbulb, GitBranch } from 'lucide-react';

interface GraphVisualizationProps {
  userData?: any;
  onCreateGraph?: () => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ userData, onCreateGraph }) => {
  const { 
    loading, 
    graphData, 
    loadGraphData, 
    createGraphFromResume,
    suggestConnections,
    getNodesByType 
  } = useGraphDatabase();
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const handleCreateGraph = async () => {
    if (userData) {
      const success = await createGraphFromResume(userData);
      if (success && onCreateGraph) {
        onCreateGraph();
      }
    }
  };

  const handleLoadSuggestions = async () => {
    setLoadingSuggestions(true);
    const newSuggestions = await suggestConnections();
    setSuggestions(newSuggestions);
    setLoadingSuggestions(false);
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'person':
        return <User className="h-4 w-4" />;
      case 'company':
        return <Building2 className="h-4 w-4" />;
      case 'school':
        return <GraduationCap className="h-4 w-4" />;
      case 'skill':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Network className="h-4 w-4" />;
    }
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'person':
        return 'bg-blue-100 text-blue-800';
      case 'company':
        return 'bg-green-100 text-green-800';
      case 'school':
        return 'bg-purple-100 text-purple-800';
      case 'skill':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNode = (node: any) => (
    <div key={node.id} className="p-3 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {getNodeIcon(node.node_type)}
        <Badge variant="secondary" className={getNodeColor(node.node_type)}>
          {node.node_type}
        </Badge>
      </div>
      <h4 className="font-medium text-sm mb-1">
        {node.properties.name || node.properties.title || 'Unnamed'}
      </h4>
      {node.properties.company && (
        <p className="text-xs text-muted-foreground">at {node.properties.company}</p>
      )}
      {node.properties.degree && (
        <p className="text-xs text-muted-foreground">{node.properties.degree}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Professional Knowledge Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasGraphData = graphData.nodes.length > 0;

  if (!hasGraphData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Professional Knowledge Graph
          </CardTitle>
          <CardDescription>
            Create a knowledge graph from your resume data to discover professional connections and insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Graph Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Transform your resume into an interactive knowledge graph to visualize professional relationships.
            </p>
            {userData && (
              <Button onClick={handleCreateGraph} disabled={loading}>
                Create Professional Graph
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const personNodes = getNodesByType('person');
  const companyNodes = getNodesByType('company');
  const schoolNodes = getNodesByType('school');
  const skillNodes = getNodesByType('skill');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Professional Knowledge Graph
        </CardTitle>
        <CardDescription>
          Your professional network visualized as an interactive knowledge graph with {graphData.nodes.length} nodes and {graphData.relationships.length} connections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="suggestions">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{personNodes.length}</div>
                <div className="text-sm text-muted-foreground">People</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{companyNodes.length}</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{schoolNodes.length}</div>
                <div className="text-sm text-muted-foreground">Schools</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Lightbulb className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{skillNodes.length}</div>
                <div className="text-sm text-muted-foreground">Skills</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recent Nodes</h4>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {graphData.nodes.slice(0, 5).map(renderNode)}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <ScrollArea className="h-60">
              <div className="grid gap-3">
                {companyNodes.map(renderNode)}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <ScrollArea className="h-60">
              <div className="grid gap-3">
                {skillNodes.map(renderNode)}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Connection Insights</h4>
              <Button 
                onClick={handleLoadSuggestions} 
                disabled={loadingSuggestions}
                variant="outline"
                size="sm"
              >
                {loadingSuggestions ? 'Loading...' : 'Generate Insights'}
              </Button>
            </div>
            
            <ScrollArea className="h-60">
              <div className="space-y-3">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        <strong>{suggestion.from.properties.name}</strong> → <strong>{suggestion.to.properties.name}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2" />
                    <p>Click "Generate Insights" to discover potential connections.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GraphVisualization;
