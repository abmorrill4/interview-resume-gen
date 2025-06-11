
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileUpdateService } from '@/services/ProfileUpdateService';
import { FileText, Download, Brain, CheckCircle, AlertCircle, Eye, ArrowLeft } from 'lucide-react';

interface DocumentViewerProps {
  documentId: string;
  onBack: () => void;
}

interface ProcessedData {
  experiences?: any[];
  skills?: any[];
  education?: any[];
  projects?: any[];
  achievements?: any[];
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onBack }) => {
  const { documents, downloadDocument } = useDocumentUpload();
  const { toast } = useToast();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  const document = documents.find(doc => doc.id === documentId);

  useEffect(() => {
    if (document?.extracted_data) {
      setProcessedData(document.extracted_data);
    }
  }, [document]);

  const loadDocumentContent = async () => {
    if (!document) return;
    
    setLoadingContent(true);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const text = await data.text();
      setDocumentContent(text);
    } catch (error) {
      console.error('Error loading document content:', error);
      toast({
        title: "Error",
        description: "Failed to load document content.",
        variant: "destructive"
      });
    } finally {
      setLoadingContent(false);
    }
  };

  const processWithAI = async () => {
    if (!document || !user) return;

    setProcessing(true);
    try {
      // Load document content if not already loaded
      if (!documentContent) {
        await loadDocumentContent();
      }

      // Call the AI processing function
      const { data, error } = await supabase.functions.invoke('enhance-content', {
        body: {
          prompt: `Extract structured profile information from this document. 

Extract:
1. Work Experience (job titles, companies, dates, responsibilities)
2. Skills (technical and soft skills with proficiency if mentioned)
3. Education (degrees, institutions, fields of study, graduation dates)
4. Projects (names, descriptions, timeframes)
5. Achievements (accomplishments with metrics if available)

Document content: ${documentContent}

Respond ONLY with valid JSON in this exact format:
{
  "experiences": [{"job_title": "", "company_name": "", "start_date": "", "end_date": "", "description": ""}],
  "skills": [{"name": "", "type": "Technical|Soft", "proficiency_level": "Beginner|Intermediate|Advanced|Expert", "years_of_experience": 0}],
  "education": [{"degree_name": "", "institution_name": "", "field_of_study": "", "completion_date": ""}],
  "projects": [{"project_name": "", "description": "", "start_date": "", "end_date": ""}],
  "achievements": [{"description": "", "date_achieved": "", "metric_value": 0, "metric_unit": ""}]
}`
        }
      });

      if (error) throw error;

      const extractedData = JSON.parse(data.enhancedContent);
      setProcessedData(extractedData);

      // Update the document record with extracted data
      const { error: updateError } = await supabase
        .from('uploaded_documents')
        .update({
          extracted_data: extractedData,
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      setShowApprovalDialog(true);

      toast({
        title: "Processing complete",
        description: "AI has extracted profile data from your document. Please review before adding to your profile."
      });

    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update status to failed
      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      toast({
        title: "Processing failed",
        description: "There was an error processing your document with AI.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const approveAndAddToProfile = async () => {
    if (!processedData || !user) return;

    try {
      const result = await ProfileUpdateService.processInterviewMessage(
        user.id,
        JSON.stringify(processedData)
      );

      if (result.updated) {
        const totalAdded = Object.values(result.addedItems).reduce((sum, count) => sum + count, 0);
        toast({
          title: "Profile updated",
          description: `Successfully added ${totalAdded} new items to your profile.`
        });
      } else {
        toast({
          title: "No new data",
          description: "No new information was found to add to your profile.",
          variant: "outline"
        });
      }

      setShowApprovalDialog(false);
    } catch (error) {
      console.error('Error adding to profile:', error);
      toast({
        title: "Error",
        description: "Failed to add data to your profile.",
        variant: "destructive"
      });
    }
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Processed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{document.file_name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</span>
          </div>
        </div>
        {getStatusBadge(document.processing_status)}
      </div>

      {/* Document Info and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </CardTitle>
          <CardDescription>
            Review and process your document with AI to extract profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Document Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {document.document_type.replace('_', ' ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => downloadDocument(document.file_path, document.file_name)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              {!documentContent && (
                <Button
                  variant="secondary"
                  onClick={loadDocumentContent}
                  disabled={loadingContent}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {loadingContent ? 'Loading...' : 'Preview'}
                </Button>
              )}
            </div>
          </div>

          {/* Document Preview */}
          {documentContent && (
            <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Document Preview:</p>
              <pre className="text-xs whitespace-pre-wrap">{documentContent.substring(0, 1000)}...</pre>
            </div>
          )}

          {/* AI Processing */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Processing</p>
                <p className="text-sm text-muted-foreground">
                  Extract profile information automatically using AI
                </p>
              </div>
              <Button
                onClick={processWithAI}
                disabled={processing || document.processing_status === 'processing'}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                {processing ? 'Processing...' : 'Process with AI'}
              </Button>
            </div>
          </div>

          {/* Show processed data preview */}
          {processedData && (
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Extracted Data Preview:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-600">Experiences</p>
                  <p>{processedData.experiences?.length || 0} found</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">Skills</p>
                  <p>{processedData.skills?.length || 0} found</p>
                </div>
                <div>
                  <p className="font-medium text-purple-600">Education</p>
                  <p>{processedData.education?.length || 0} found</p>
                </div>
                <div>
                  <p className="font-medium text-orange-600">Projects</p>
                  <p>{processedData.projects?.length || 0} found</p>
                </div>
                <div>
                  <p className="font-medium text-red-600">Achievements</p>
                  <p>{processedData.achievements?.length || 0} found</p>
                </div>
              </div>
              <Button
                onClick={() => setShowApprovalDialog(true)}
                className="mt-4 w-full"
                variant="default"
              >
                Review & Add to Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Extracted Data</DialogTitle>
            <DialogDescription>
              Review the information extracted from your document before adding it to your profile.
            </DialogDescription>
          </DialogHeader>
          
          {processedData && (
            <div className="space-y-6">
              {/* Experiences */}
              {processedData.experiences && processedData.experiences.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-600 mb-2">Work Experience ({processedData.experiences.length})</h3>
                  <div className="space-y-2">
                    {processedData.experiences.map((exp, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-blue-50">
                        <p className="font-medium">{exp.job_title} at {exp.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-sm mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {processedData.skills && processedData.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Skills ({processedData.skills.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {processedData.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50">
                        {skill.name} ({skill.type})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {processedData.education && processedData.education.length > 0 && (
                <div>
                  <h3 className="font-semibold text-purple-600 mb-2">Education ({processedData.education.length})</h3>
                  <div className="space-y-2">
                    {processedData.education.map((edu, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-purple-50">
                        <p className="font-medium">{edu.degree_name}</p>
                        <p className="text-sm">{edu.institution_name} - {edu.field_of_study}</p>
                        {edu.completion_date && (
                          <p className="text-sm text-muted-foreground">{edu.completion_date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={approveAndAddToProfile} className="flex-1">
                  Add All to Profile
                </Button>
                <Button variant="secondary" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentViewer;
