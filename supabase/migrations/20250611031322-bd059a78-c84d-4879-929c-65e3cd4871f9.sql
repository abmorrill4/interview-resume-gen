
-- Create tables to support graph database integration
CREATE TABLE public.graph_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_type text NOT NULL, -- 'person', 'company', 'skill', 'project', etc.
  properties jsonb NOT NULL DEFAULT '{}',
  external_id text, -- For syncing with Neo4j
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.graph_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_node_id uuid REFERENCES public.graph_nodes(id) ON DELETE CASCADE NOT NULL,
  to_node_id uuid REFERENCES public.graph_nodes(id) ON DELETE CASCADE NOT NULL,
  relationship_type text NOT NULL, -- 'WORKED_AT', 'HAS_SKILL', 'WORKED_ON', etc.
  properties jsonb NOT NULL DEFAULT '{}',
  external_id text, -- For syncing with Neo4j
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_graph_nodes_user_id ON public.graph_nodes(user_id);
CREATE INDEX idx_graph_nodes_type ON public.graph_nodes(node_type);
CREATE INDEX idx_graph_relationships_user_id ON public.graph_relationships(user_id);
CREATE INDEX idx_graph_relationships_from_node ON public.graph_relationships(from_node_id);
CREATE INDEX idx_graph_relationships_to_node ON public.graph_relationships(to_node_id);
CREATE INDEX idx_graph_relationships_type ON public.graph_relationships(relationship_type);

-- Enable RLS
ALTER TABLE public.graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_relationships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own graph nodes" 
  ON public.graph_nodes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own graph nodes" 
  ON public.graph_nodes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own graph nodes" 
  ON public.graph_nodes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own graph nodes" 
  ON public.graph_nodes 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own graph relationships" 
  ON public.graph_relationships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own graph relationships" 
  ON public.graph_relationships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own graph relationships" 
  ON public.graph_relationships 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own graph relationships" 
  ON public.graph_relationships 
  FOR DELETE 
  USING (auth.uid() = user_id);
