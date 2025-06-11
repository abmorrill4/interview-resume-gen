
import React from 'react';
import GraphVisualization from '@/components/GraphVisualization';

const KnowledgeGraphPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Knowledge Graph
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore the relationships and connections in your professional profile
            </p>
          </div>
          <GraphVisualization />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
