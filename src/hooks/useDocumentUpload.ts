
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadDocumentOptions {
  file: File;
  documentType: 'resume' | 'writing_sample' | 'other';
  onProgress?: (progress: number) => void;
}

interface UploadedDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  document_type: string;
  processing_status: string;
  extracted_data: any;
  error_message: string | null;
  uploaded_at: string;
  processed_at: string | null;
}

export const useDocumentUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const uploadDocument = useCallback(async ({ file, documentType, onProgress }: UploadDocumentOptions) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { data: documentData, error: dbError } = await supabase
        .from('uploaded_documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          document_type: documentType,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`
      });

      // Refresh documents list
      await fetchDocuments();

      return documentData;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const deleteDocument = useCallback(async (documentId: string, filePath: string) => {
    if (!user) return false;

    setLoading(true);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully."
      });

      // Refresh documents list
      await fetchDocuments();

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchDocuments]);

  const downloadDocument = useCallback(async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the document.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    downloadDocument,
    documents,
    loading
  };
};
