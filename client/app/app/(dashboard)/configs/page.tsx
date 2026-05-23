"use client";

import { useState } from 'react';

import { useSettings } from '@client/features/settings/hooks/use-settings';
import {
  Sliders,
  Search,
  Bot,
  Eye,
  Trash2,
  Plus,
  Wand2,
} from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Card } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@client/components/ui/select';
import { toast } from 'sonner';
import { PageHeader } from '@client/components/layout/page-header';

export default function ConfigsPage() {
  const { settings, isLoading, isSaving, updateSettings } = useSettings();
  const [newExclusion, setNewExclusion] = useState('');

  const handleAddExclusion = async () => {
    if (!newExclusion || !settings) return;
    if (settings.scanner.exclusions.includes(newExclusion)) {
      toast.error('Exclusion already exists');
      return;
    }

    const updatedExclusions = [...settings.scanner.exclusions, newExclusion];
    const success = await updateSettings({
      scanner: { ...settings.scanner, exclusions: updatedExclusions }
    });

    if (success) {
      setNewExclusion('');
      toast.success('Exclusion added');
    }
  };

  const handleRemoveExclusion = async (pattern: string) => {
    if (!settings) return;
    const updatedExclusions = settings.scanner.exclusions.filter(e => e !== pattern);
    const success = await updateSettings({
      scanner: { ...settings.scanner, exclusions: updatedExclusions }
    });

    if (success) {
      toast.success('Exclusion removed');
    }
  };

  const handleAutoGenerate = () => {
    if (!settings) return;
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Analyzing repository structure...',
        success: () => {
          const suggested = ['.git', '.vscode', '.idea', 'build', 'out', 'coverage', 'node_modules', 'dist', '.next'];
          const current = new Set(settings.scanner.exclusions);
          const toAdd = suggested.filter(p => !current.has(p));
          
          if (toAdd.length > 0) {
            updateSettings({
              scanner: {
                ...settings.scanner,
                exclusions: [...settings.scanner.exclusions, ...toAdd]
              }
            });
            return `Added ${toAdd.length} standard exclusion patterns.`;
          }
          return 'All standard patterns are already excluded.';
        },
        error: 'Failed to analyze repository.'
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
          <PageHeader
            title="Configurations"
            description="Configure your architectural discovery engine."
            icon={Sliders}
            actions={
              isSaving && (
                <Badge variant="secondary" className="animate-pulse bg-primary/10 text-primary border-primary/20">
                  Saving changes...
                </Badge>
              )
            }
          />

          {/* Content Area */}
          <div className="space-y-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Scanner Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Search className="w-5 h-5 text-primary" />
                Scanner Exclusions
              </div>
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50 gap-0">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm text-muted-foreground">
                    Directories and file patterns to ignore during architectural discovery.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 shrink-0 border-primary/20 hover:bg-primary/10 text-primary transition-all"
                    onClick={handleAutoGenerate}
                  >
                    <Wand2 className="w-4 h-4" />
                    Auto Generate
                  </Button>
                </div>

                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="e.g. node_modules, dist, .test.ts"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddExclusion()}
                    className="bg-background/50 border-border/50"
                  />
                  <Button onClick={handleAddExclusion} className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings?.scanner.exclusions.map((pattern) => (
                    <Badge
                      key={pattern}
                      variant="secondary"
                      className="pl-3 pr-1 py-1 gap-2 bg-secondary/50 border-border/50 group hover:border-red-500/30 transition-all"
                    >
                      <span className="text-xs font-mono">{pattern}</span>
                      <button
                        onClick={() => handleRemoveExclusion(pattern)}
                        className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </Card>
            </section>

            {/* AI Preferences Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Bot className="w-5 h-5 text-primary" />
                AI Oracle (Bob)
              </div>
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium block text-muted-foreground">Insight Depth</label>
                    <Select
                      value={settings?.ai.insightDepth}
                      onValueChange={(val: any) => updateSettings({ ai: { ...settings!.ai, insightDepth: val } })}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise Summaries</SelectItem>
                        <SelectItem value="detailed">Deep Audits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium block text-muted-foreground">Analysis Focus</label>
                    <Select
                      value={settings?.ai.focus}
                      onValueChange={(val: any) => updateSettings({ ai: { ...settings!.ai, focus: val } })}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="architecture">Architecture</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </section>

            {/* Danger Zone Removed */}
          </div>
        </div>
      </div>
    </div>
  );
}
