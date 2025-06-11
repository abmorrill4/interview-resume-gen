
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Briefcase, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProfileData } from '@/hooks/useProfileData';
import { format } from 'date-fns';
import { InlineEdit } from '@/components/ui/inline-edit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import TargetedInterviewTrigger from '@/components/interview/TargetedInterviewTrigger';

interface ExperienceFormData {
  job_title: string;
  company_name: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

const ExperiencePage: React.FC = () => {
  const { experiences, fetchExperiences, addExperience, updateExperience, deleteExperience, loading } = useProfileData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ExperienceFormData>({
    defaultValues: {
      job_title: '',
      company_name: '',
      start_date: '',
      end_date: '',
      description: ''
    }
  });

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const onSubmit = async (data: ExperienceFormData) => {
    const experienceData = {
      ...data,
      end_date: data.end_date || undefined
    };

    await addExperience(experienceData);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleInlineUpdate = async (experienceId: string, field: string, value: string) => {
    const updates = { [field]: value || undefined };
    await updateExperience(experienceId, updates);
  };

  const handleDelete = async (id: string) => {
    await deleteExperience(id);
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = format(new Date(startDate), 'MMM yyyy');
    const end = endDate ? format(new Date(endDate), 'MMM yyyy') : 'Present';
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Work Experience</h2>
            <p className="text-muted-foreground">Manage your professional experience</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => form.reset()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Experience</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="job_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your responsibilities and achievements..."
                          className="min-h-24"
                          {...field} 
                        />
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
                    {loading ? 'Adding...' : 'Add Experience'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && experiences.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading experiences...</p>
        </div>
      ) : experiences.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No work experience added yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your professional profile by adding your work experience.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <InlineEdit
                      value={experience.job_title}
                      onSave={(value) => handleInlineUpdate(experience.id, 'job_title', value)}
                      className="text-xl font-semibold"
                      placeholder="Job Title"
                    />
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <InlineEdit
                        value={experience.company_name}
                        onSave={(value) => handleInlineUpdate(experience.id, 'company_name', value)}
                        className="font-medium"
                        placeholder="Company Name"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Start:</span>
                        <InlineEdit
                          value={experience.start_date}
                          onSave={(value) => handleInlineUpdate(experience.id, 'start_date', value)}
                          type="date"
                          displayValue={experience.start_date ? format(new Date(experience.start_date), 'MMM yyyy') : undefined}
                          placeholder="Start date"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>End:</span>
                        <InlineEdit
                          value={experience.end_date || ''}
                          onSave={(value) => handleInlineUpdate(experience.id, 'end_date', value)}
                          type="date"
                          displayValue={experience.end_date ? format(new Date(experience.end_date), 'MMM yyyy') : 'Present'}
                          placeholder="End date (optional)"
                        />
                      </div>
                      
                      {!experience.end_date && (
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <TargetedInterviewTrigger
                      contextType="experience_deep_dive"
                      contextData={experience}
                      title={`Deep Dive: ${experience.job_title}`}
                      description="Expand on this work experience with AI-guided questions about your responsibilities, achievements, and impact."
                    />
                    
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
                          <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this work experience? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(experience.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Description:</p>
                  <InlineEdit
                    value={experience.description || ''}
                    onSave={(value) => handleInlineUpdate(experience.id, 'description', value)}
                    multiline
                    placeholder="Add description of your responsibilities and achievements..."
                    className="text-muted-foreground leading-relaxed min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperiencePage;
