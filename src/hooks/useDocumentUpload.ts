
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
      // Create unique file path with user ID folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to path:', filePath);

      // Upload to storage bucket (the bucket should exist based on the migration)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Create database record with explicit user_id
      const { data: documentData, error: dbError } = await supabase
        .from('uploaded_documents')
        .insert({
          user_id: user.id, // Explicitly set user_id for RLS
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          document_type: documentType,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Document record created:', documentData);

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
    if (!user) {
      console.log('No user found, skipping document fetch');
      return;
    }

    try {
      console.log('Fetching documents for user:', user.id);
      
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('Documents fetched:', data);
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
      console.log('Deleting document:', documentId, filePath);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Don't throw here - the file might already be deleted or not exist
        console.warn('Storage delete failed, continuing with database deletion');
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id); // Ensure user can only delete their own documents

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to download documents.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Downloading document:', filePath);

      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the document.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  return {
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    downloadDocument,
    documents,
    loading
  };
};
