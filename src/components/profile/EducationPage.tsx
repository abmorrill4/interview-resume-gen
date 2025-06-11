import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, GraduationCap, Calendar, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProfileData } from '@/hooks/useProfileData';
import { format } from 'date-fns';
import { InlineEdit } from '@/components/ui/inline-edit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface EducationFormData {
  degree_name: string;
  institution_name: string;
  field_of_study: string;
  completion_date?: string;
}

const EducationPage: React.FC = () => {
  const { education, fetchEducation, addEducation, updateEducation, deleteEducation, loading } = useProfileData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<EducationFormData>({
    defaultValues: {
      degree_name: '',
      institution_name: '',
      field_of_study: '',
      completion_date: ''
    }
  });

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const onSubmit = async (data: EducationFormData) => {
    const educationData = {
      ...data,
      completion_date: data.completion_date || undefined
    };

    await addEducation(educationData);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleInlineUpdate = async (educationId: string, field: string, value: string) => {
    const updates = { [field]: value || undefined };
    await updateEducation(educationId, updates);
  };

  const handleDelete = async (id: string) => {
    await deleteEducation(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Education</h2>
            <p className="text-muted-foreground">Manage your educational background</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={() => form.reset()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="degree_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bachelor of Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="field_of_study"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="institution_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="University of Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completion_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Education'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && education.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading education...</p>
        </div>
      ) : education.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No education added yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your educational background to complete your profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {education.map((edu) => (
            <Card key={edu.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <InlineEdit
                      value={edu.degree_name}
                      onSave={(value) => handleInlineUpdate(edu.id, 'degree_name', value)}
                      className="text-xl font-semibold"
                      placeholder="Degree Name"
                    />
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <InlineEdit
                        value={edu.institution_name}
                        onSave={(value) => handleInlineUpdate(edu.id, 'institution_name', value)}
                        className="font-medium"
                        placeholder="Institution Name"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="w-fit">
                        <InlineEdit
                          value={edu.field_of_study}
                          onSave={(value) => handleInlineUpdate(edu.id, 'field_of_study', value)}
                          placeholder="Field of Study"
                        />
                      </Badge>
                      
                      {edu.completion_date ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Completed:</span>
                          <InlineEdit
                            value={edu.completion_date}
                            onSave={(value) => handleInlineUpdate(edu.id, 'completion_date', value)}
                            type="date"
                            displayValue={format(new Date(edu.completion_date), 'MMM yyyy')}
                            placeholder="Completion date"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <InlineEdit
                            value=""
                            onSave={(value) => handleInlineUpdate(edu.id, 'completion_date', value)}
                            type="date"
                            placeholder="Add completion date"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Education</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this education entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(edu.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationPage;
