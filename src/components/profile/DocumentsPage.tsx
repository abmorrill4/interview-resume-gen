
import React from 'react';
import DocumentUpload from '@/components/DocumentUpload';

const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Documents</h2>
          <p className="text-muted-foreground">
            Upload and manage your professional documents
          </p>
        </div>
      </div>

      <DocumentUpload />
    </div>
  );
};

export default DocumentsPage;
