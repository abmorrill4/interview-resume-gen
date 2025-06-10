
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, ArrowLeft, FileText, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedInterview } from "@/hooks/useEnhancedInterview";

interface UserData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
  };
  workExperience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    university: string;
    graduationYear: string;
  }>;
  skills: string[];
  achievements: string[];
}

interface RealtimeResumeProps {
  userData: UserData;
  onStartOver: () => void;
}

const RealtimeResume: React.FC<RealtimeResumeProps> = ({ userData, onStartOver }) => {
  const { toast } = useToast();
  const { enhanceContent, isEnhancing } = useEnhancedInterview();
  const [markdownResume, setMarkdownResume] = useState('');
  const [editableUserData, setEditableUserData] = useState<UserData>(userData);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const generateMarkdownResume = (data: UserData): string => {
    const { personalInfo, workExperience, education, skills, achievements } = data;
    
    let markdown = `# ${personalInfo.fullName}\n\n`;
    
    // Contact Information
    markdown += `## Contact Information\n`;
    markdown += `- Email: ${personalInfo.email}\n`;
    markdown += `- Phone: ${personalInfo.phone}\n`;
    if (personalInfo.linkedin) {
      markdown += `- LinkedIn: ${personalInfo.linkedin}\n`;
    }
    markdown += `\n`;
    
    // Work Experience
    if (workExperience.length > 0) {
      markdown += `## Work Experience\n`;
      workExperience.forEach(job => {
        markdown += `### ${job.jobTitle} at ${job.company}\n`;
        markdown += `- ${job.startDate} - ${job.endDate}\n`;
        markdown += `- Responsibilities and achievements:\n`;
        job.responsibilities.forEach(responsibility => {
          markdown += `  - ${responsibility}\n`;
        });
        markdown += `\n`;
      });
    }
    
    // Education
    if (education.length > 0) {
      markdown += `## Education\n`;
      education.forEach(edu => {
        markdown += `### ${edu.degree} in ${edu.field}\n`;
        markdown += `- ${edu.university}, ${edu.graduationYear}\n\n`;
      });
    }
    
    // Skills
    if (skills.length > 0) {
      markdown += `## Skills\n`;
      skills.forEach(skill => {
        markdown += `- ${skill}\n`;
      });
      markdown += `\n`;
    }
    
    // Achievements
    if (achievements.length > 0) {
      markdown += `## Achievements\n`;
      achievements.forEach(achievement => {
        markdown += `- ${achievement}\n`;
      });
    }
    
    return markdown;
  };

  useEffect(() => {
    const newMarkdown = generateMarkdownResume(editableUserData);
    setMarkdownResume(newMarkdown);
  }, [editableUserData]);

  useEffect(() => {
    if (isAutoUpdateEnabled) {
      setEditableUserData(userData);
    }
  }, [userData, isAutoUpdateEnabled]);

  const handleEnhanceSection = async (content: string, type: string, field: keyof UserData) => {
    if (!content.trim()) return;

    const enhanced = await enhanceContent(content, type);
    
    if (enhanced !== content && field === 'skills') {
      const enhancedSkills = enhanced.split(',').map(skill => skill.trim()).filter(Boolean);
      setEditableUserData(prev => ({
        ...prev,
        skills: enhancedSkills
      }));
    } else if (enhanced !== content && field === 'achievements') {
      const enhancedAchievements = enhanced.split('\n').map(achievement => achievement.trim()).filter(Boolean);
      setEditableUserData(prev => ({
        ...prev,
        achievements: enhancedAchievements
      }));
    }

    toast({
      title: "Section enhanced!",
      description: `Your ${type} section has been improved by AI.`,
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownResume);
      toast({
        title: "Copied to clipboard!",
        description: "Your resume has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editableUserData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started!",
      description: "Your resume is being downloaded as a markdown file.",
    });
  };

  const renderPreview = () => {
    return (
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ 
          __html: markdownResume
            .replace(/^# (.*)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
            .replace(/^## (.*)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-blue-700">$1</h2>')
            .replace(/^### (.*)/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
            .replace(/^- (.*)/gm, '<div class="ml-4 mb-1">• $1</div>')
            .replace(/\n/g, '<br>')
        }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Your Enhanced Resume is Ready!
            </h1>
            <p className="text-muted-foreground">
              Your AI-enhanced resume with real-time updates. Edit, enhance, and perfect it below.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => setIsAutoUpdateEnabled(!isAutoUpdateEnabled)}
              variant="outline"
              className={`flex items-center gap-2 ${isAutoUpdateEnabled ? 'bg-green-100' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
              Auto-Update: {isAutoUpdateEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview Column */}
            {showPreview && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Resume Preview</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCopyToClipboard}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        onClick={handleDownload}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {renderPreview()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Markdown Source Column */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Markdown Source</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEnhanceSection(editableUserData.skills.join(', '), 'skills', 'skills')}
                      disabled={isEnhancing}
                      size="sm"
                      variant="outline"
                    >
                      Enhance Skills
                    </Button>
                    <Button
                      onClick={() => handleEnhanceSection(editableUserData.achievements.join('\n'), 'achievements', 'achievements')}
                      disabled={isEnhancing}
                      size="sm"
                      variant="outline"
                    >
                      Enhance Achievements
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={markdownResume}
                  onChange={(e) => setMarkdownResume(e.target.value)}
                  className="font-mono text-sm min-h-96 resize-none"
                  placeholder="Your markdown resume will appear here..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  You can edit the markdown directly. Changes will be reflected when you copy or download.
                  {isEnhancing && ' AI is enhancing your content...'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={onStartOver}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Create Another Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeResume;
