
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GraphNode {
  id: string;
  node_type: string;
  properties: Record<string, any>;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

interface GraphRelationship {
  id: string;
  from_node_id: string;
  to_node_id: string;
  relationship_type: string;
  properties: Record<string, any>;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

interface ConnectionSuggestion {
  type: string;
  from: GraphNode;
  to: GraphNode;
  confidence: number;
  reason: string;
}

export const useGraphDatabase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], relationships: [] });

  const createGraphFromResume = useCallback(async (resumeData: any): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create graph data.",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('graph-operations', {
        body: { 
          operation: 'create_graph_from_resume',
          data: resumeData
        }
      });

      if (error) throw error;

      toast({
        title: "Graph created!",
        description: `Successfully created ${data.nodesCreated} nodes from your resume.`,
      });

      // Refresh graph data
      await loadGraphData();
      
      return true;
    } catch (error) {
      console.error('Error creating graph from resume:', error);
      toast({
        title: "Graph creation failed",
        description: "There was an error creating your professional graph.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const loadGraphData = useCallback(async (): Promise<GraphData | null> => {
    if (!user) return null;

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('graph-operations', {
        body: { 
          operation: 'get_graph_data'
        }
      });

      if (error) throw error;

      const graphDataResult = {
        nodes: data.nodes || [],
        relationships: data.relationships || []
      };
      
      setGraphData(graphDataResult);
      return graphDataResult;
    } catch (error) {
      console.error('Error loading graph data:', error);
      toast({
        title: "Loading failed",
        description: "There was an error loading your professional graph.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const queryConnections = useCallback(async (nodeType?: string, properties?: Record<string, any>): Promise<GraphNode[]> => {
    if (!user) return [];

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('graph-operations', {
        body: { 
          operation: 'query_connections',
          data: { nodeType, properties }
        }
      });

      if (error) throw error;

      return data.nodes || [];
    } catch (error) {
      console.error('Error querying connections:', error);
      toast({
        title: "Query failed",
        description: "There was an error querying connections.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const suggestConnections = useCallback(async (): Promise<ConnectionSuggestion[]> => {
    if (!user) return [];

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('graph-operations', {
        body: { 
          operation: 'suggest_connections',
          data: {}
        }
      });

      if (error) throw error;

      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting connection suggestions:', error);
      toast({
        title: "Suggestions failed",
        description: "There was an error generating connection suggestions.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getNodesByType = useCallback((nodeType: string): GraphNode[] => {
    return graphData.nodes.filter(node => node.node_type === nodeType);
  }, [graphData]);

  const getRelationshipsByType = useCallback((relationshipType: string): GraphRelationship[] => {
    return graphData.relationships.filter(rel => rel.relationship_type === relationshipType);
  }, [graphData]);

  const getConnectedNodes = useCallback((nodeId: string): GraphNode[] => {
    const connectedNodeIds = new Set<string>();
    
    graphData.relationships.forEach(rel => {
      if (rel.from_node_id === nodeId) {
        connectedNodeIds.add(rel.to_node_id);
      } else if (rel.to_node_id === nodeId) {
        connectedNodeIds.add(rel.from_node_id);
      }
    });

    return graphData.nodes.filter(node => connectedNodeIds.has(node.id));
  }, [graphData]);

  return {
    loading,
    graphData,
    createGraphFromResume,
    loadGraphData,
    queryConnections,
    suggestConnections,
    getNodesByType,
    getRelationshipsByType,
    getConnectedNodes
  };
};
