
import React, { useState } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentViewer from '@/components/DocumentViewer';

const DocumentsPage: React.FC = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  if (selectedDocumentId) {
    return (
      <DocumentViewer
        documentId={selectedDocumentId}
        onBack={() => setSelectedDocumentId(null)}
      />
    );
  }

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

      <DocumentUpload onDocumentSelect={setSelectedDocumentId} />
    </div>
  );
};

export default DocumentsPage;
