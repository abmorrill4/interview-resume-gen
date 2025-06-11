
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
      // Use direct database queries instead of edge functions for now
      const nodes: GraphNode[] = [];
      const relationships: GraphRelationship[] = [];

      // Create person node for the user
      const personNode = {
        id: crypto.randomUUID(),
        node_type: 'person',
        properties: {
          name: resumeData.personalInfo?.fullName || 'User',
          email: resumeData.personalInfo?.email || '',
          phone: resumeData.personalInfo?.phone || '',
          linkedin: resumeData.personalInfo?.linkedin || ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      nodes.push(personNode);

      // Create company nodes from work experience
      if (resumeData.workExperience) {
        resumeData.workExperience.forEach((exp: any) => {
          const companyNode = {
            id: crypto.randomUUID(),
            node_type: 'company',
            properties: {
              name: exp.company,
              position: exp.jobTitle,
              startDate: exp.startDate,
              endDate: exp.endDate
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          nodes.push(companyNode);

          // Create relationship between person and company
          relationships.push({
            id: crypto.randomUUID(),
            from_node_id: personNode.id,
            to_node_id: companyNode.id,
            relationship_type: 'WORKED_AT',
            properties: {
              role: exp.jobTitle,
              duration: `${exp.startDate} - ${exp.endDate}`
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      // Create school nodes from education
      if (resumeData.education) {
        resumeData.education.forEach((edu: any) => {
          const schoolNode = {
            id: crypto.randomUUID(),
            node_type: 'school',
            properties: {
              name: edu.university,
              degree: edu.degree,
              field: edu.field,
              graduationYear: edu.graduationYear
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          nodes.push(schoolNode);

          // Create relationship between person and school
          relationships.push({
            id: crypto.randomUUID(),
            from_node_id: personNode.id,
            to_node_id: schoolNode.id,
            relationship_type: 'STUDIED_AT',
            properties: {
              degree: edu.degree,
              field: edu.field,
              year: edu.graduationYear
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      // Create skill nodes
      if (resumeData.skills) {
        resumeData.skills.forEach((skill: string) => {
          const skillNode = {
            id: crypto.randomUUID(),
            node_type: 'skill',
            properties: {
              name: skill,
              category: 'Technical'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          nodes.push(skillNode);

          // Create relationship between person and skill
          relationships.push({
            id: crypto.randomUUID(),
            from_node_id: personNode.id,
            to_node_id: skillNode.id,
            relationship_type: 'HAS_SKILL',
            properties: {
              proficiency: 'Intermediate'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      // Store the graph data in local state
      setGraphData({ nodes, relationships });

      toast({
        title: "Graph created!",
        description: `Successfully created ${nodes.length} nodes from your resume.`,
      });
      
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

    // For now, return the existing graph data
    // In the future, this would load from the database
    return graphData;
  }, [user, graphData]);

  const queryConnections = useCallback(async (nodeType?: string, properties?: Record<string, any>): Promise<GraphNode[]> => {
    if (!user) return [];

    // Filter nodes based on type and properties
    let filteredNodes = graphData.nodes;
    
    if (nodeType) {
      filteredNodes = filteredNodes.filter(node => node.node_type === nodeType);
    }
    
    if (properties) {
      filteredNodes = filteredNodes.filter(node => {
        return Object.entries(properties).every(([key, value]) => 
          node.properties[key] === value
        );
      });
    }

    return filteredNodes;
  }, [user, graphData]);

  const suggestConnections = useCallback(async (): Promise<ConnectionSuggestion[]> => {
    if (!user) return [];

    const suggestions: ConnectionSuggestion[] = [];
    
    // Generate some basic suggestions based on the graph data
    const companies = graphData.nodes.filter(node => node.node_type === 'company');
    const skills = graphData.nodes.filter(node => node.node_type === 'skill');
    
    if (companies.length > 1) {
      suggestions.push({
        type: 'Career Progression',
        from: companies[0],
        to: companies[1],
        confidence: 0.8,
        reason: 'Career progression between companies shows professional growth'
      });
    }

    if (skills.length > 2) {
      suggestions.push({
        type: 'Skill Synergy',
        from: skills[0],
        to: skills[1],
        confidence: 0.7,
        reason: 'These skills often complement each other in professional settings'
      });
    }

    return suggestions;
  }, [user, graphData]);

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
