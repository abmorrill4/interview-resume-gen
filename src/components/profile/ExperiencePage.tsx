
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
  const [editingExperience, setEditingExperience] = useState<any>(null);

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

    if (editingExperience) {
      await updateExperience(editingExperience.id, experienceData);
    } else {
      await addExperience(experienceData);
    }

    setIsDialogOpen(false);
    setEditingExperience(null);
    form.reset();
  };

  const handleEdit = (experience: any) => {
    setEditingExperience(experience);
    form.reset({
      job_title: experience.job_title,
      company_name: experience.company_name,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      description: experience.description || ''
    });
    setIsDialogOpen(true);
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
              onClick={() => {
                setEditingExperience(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? 'Edit Experience' : 'Add New Experience'}
              </DialogTitle>
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
                    {loading ? 'Saving...' : (editingExperience ? 'Update' : 'Add')} Experience
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
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{experience.job_title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">{experience.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateRange(experience.start_date, experience.end_date)}</span>
                      {!experience.end_date && (
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(experience)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(experience.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {experience.description && (
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {experience.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperiencePage;
