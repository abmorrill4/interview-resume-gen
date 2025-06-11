
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Code, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';

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
  const { userSkills, fetchUserSkills, addUserSkill, loading } = useProfileData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

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

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

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
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search skills..."
                              value={skillSearch}
                              onChange={(e) => setSkillSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredSkills.map((skill) => (
                                <SelectItem key={skill.id} value={skill.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{skill.name}</span>
                                    <Badge variant="outline" className={getSkillTypeColor(skill.type)}>
                                      {skill.type}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                  <Button type="submit" disabled={loading}>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
