"use client";

import { useState } from 'react';
import Header from '@client/components/header';
import { DynamicBreadcrumbs } from '@client/components/dynamic-breadcrumbs';
import { useSettings } from '@client/hooks/use-settings';
import {
  Sliders,
  Search,
  Bot,
  Eye,
  Trash2,
  Plus,
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header>
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
          <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Sliders className="w-8 h-8 text-primary" />
                Configurations
              </h1>
              <p className="text-muted-foreground mt-1">Configure your architectural discovery engine.</p>
            </div>
            {isSaving && (
              <Badge variant="secondary" className="animate-pulse bg-primary/10 text-primary border-primary/20">
                Saving changes...
              </Badge>
            )}
          </div>

          {/* Content Area */}
          <div className="space-y-8">
            {/* Scanner Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Search className="w-5 h-5 text-primary" />
                Scanner Exclusions
              </div>
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Directories and file patterns to ignore during architectural discovery.
                </p>

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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Insight Depth</label>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analysis Focus</label>
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
