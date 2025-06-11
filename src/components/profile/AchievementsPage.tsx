
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Award, Calendar, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProfileData } from '@/hooks/useProfileData';
import { format } from 'date-fns';

interface AchievementFormData {
  description: string;
  date_achieved?: string;
  metric_value?: number;
  metric_unit?: string;
}

const AchievementsPage: React.FC = () => {
  const { achievements, fetchAchievements, addAchievement, loading } = useProfileData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AchievementFormData>({
    defaultValues: {
      description: '',
      date_achieved: '',
      metric_value: undefined,
      metric_unit: ''
    }
  });

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const onSubmit = async (data: AchievementFormData) => {
    const achievementData = {
      ...data,
      date_achieved: data.date_achieved || undefined,
      metric_value: data.metric_value || undefined,
      metric_unit: data.metric_unit || undefined
    };

    await addAchievement(achievementData);
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-red-600" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Achievements</h2>
            <p className="text-muted-foreground">Highlight your accomplishments and notable results</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              onClick={() => form.reset()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievement Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your achievement and its impact..."
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date_achieved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Achieved (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metric_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric Value (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="metric_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric Unit (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="% increase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Achievement'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && achievements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      ) : achievements.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No achievements added yet</h3>
            <p className="text-muted-foreground mb-6">
              Showcase your accomplishments and measurable results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <p className="text-foreground leading-relaxed">{achievement.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {achievement.date_achieved && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(achievement.date_achieved), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                          {achievement.metric_value && achievement.metric_unit && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {achievement.metric_value}{achievement.metric_unit}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default AchievementsPage;
