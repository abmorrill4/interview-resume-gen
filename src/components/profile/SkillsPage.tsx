
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Code, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { Autocomplete } from '@/components/ui/autocomplete';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SkillFormData {
  skillId: string;
  proficiencyLevel: string;
  yearsOfExperience: number;
}

interface Skill {
  id: string;
  name: string;
  type: string;
}

const SkillsPage: React.FC = () => {
  const { userSkills, fetchUserSkills, addUserSkill, deleteUserSkill, loading } = useProfileData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const form = useForm<SkillFormData>({
    defaultValues: {
      skillId: '',
      proficiencyLevel: 'Intermediate',
      yearsOfExperience: 1
    }
  });

  useEffect(() => {
    fetchUserSkills();
    fetchAvailableSkills();
  }, [fetchUserSkills]);

  const fetchAvailableSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // Real-time skill search with debouncing
  useEffect(() => {
    const searchSkills = async () => {
      if (!skillSearch.trim()) {
        setFilteredSkills([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .ilike('name', `%${skillSearch}%`)
          .order('name')
          .limit(10);

        if (error) throw error;
        
        // Filter out skills already added by the user
        const userSkillIds = userSkills.map(us => us.skill_id);
        const filtered = (data || []).filter(skill => !userSkillIds.includes(skill.id));
        setFilteredSkills(filtered);
      } catch (error) {
        console.error('Error searching skills:', error);
        setFilteredSkills([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchSkills, 300);
    return () => clearTimeout(timeoutId);
  }, [skillSearch, userSkills]);

  const onSubmit = async (data: SkillFormData) => {
    await addUserSkill({
      skillId: data.skillId,
      proficiencyLevel: data.proficiencyLevel,
      yearsOfExperience: data.yearsOfExperience
    });

    setIsDialogOpen(false);
    form.reset();
    setSkillSearch('');
  };

  const handleSkillSelect = (option: any) => {
    form.setValue('skillId', option.value);
    setSkillSearch(option.label);
  };

  const handleDeleteSkill = async (skillId: string) => {
    await deleteUserSkill(skillId);
  };

  const getProficiencyColor = (level?: string) => {
    switch (level) {
      case 'Beginner': return 'bg-yellow-100 text-yellow-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-green-100 text-green-800';
      case 'Expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'Technical': return 'bg-blue-100 text-blue-800';
      case 'Soft': return 'bg-green-100 text-green-800';
      case 'Language': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const autocompleteOptions = filteredSkills.map(skill => ({
    value: skill.id,
    label: skill.name,
    data: skill
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Skills</h2>
            <p className="text-muted-foreground">Manage your professional skills and proficiency levels</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => {
                form.reset();
                setSkillSearch('');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="skillId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill</FormLabel>
                      <FormControl>
                        <Autocomplete
                          value={skillSearch}
                          onChange={setSkillSearch}
                          onSelect={handleSkillSelect}
                          options={autocompleteOptions}
                          placeholder="Search and select a skill..."
                          loading={searchLoading}
                          emptyMessage="No skills found. Try a different search term."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proficiencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proficiency Level</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  <Button type="submit" disabled={loading || !form.watch('skillId')}>
                    {loading ? 'Adding...' : 'Add Skill'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && userSkills.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading skills...</p>
        </div>
      ) : userSkills.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Code className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No skills added yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your skill profile by adding your technical and soft skills.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Proficiency</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userSkills.map((userSkill) => (
                  <TableRow key={`${userSkill.user_id}-${userSkill.skill_id}`}>
                    <TableCell className="font-medium">
                      {userSkill.skill.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSkillTypeColor(userSkill.skill.type)}>
                        {userSkill.skill.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProficiencyColor(userSkill.proficiency_level)}>
                        {userSkill.proficiency_level || 'Not specified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userSkill.years_of_experience ? 
                        `${userSkill.years_of_experience} year${userSkill.years_of_experience !== 1 ? 's' : ''}` : 
                        'Not specified'
                      }
                    </TableCell>
                    <TableCell>
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
                            <AlertDialogTitle>Remove Skill</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{userSkill.skill.name}" from your skills? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSkill(userSkill.skill_id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillsPage;
