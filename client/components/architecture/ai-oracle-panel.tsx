'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Bot, Zap, Shield, Cpu } from 'lucide-react';
import { Input } from '@client/components/ui/input';
import { Button } from '@client/components/ui/button';
import { Skeleton } from '@client/components/ui/skeleton';
import { useSettings } from '@client/hooks/use-settings';
import { Badge } from '@client/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/components/ui/select';

interface AIOraclePanelProps {
  nodes: any[];
  isLoading: boolean;
  onSearch?: (query: string) => void;
}

export function AIOraclePanel({ nodes, isLoading, onSearch }: AIOraclePanelProps) {
  const { settings, updateSettings } = useSettings();
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Generate dynamic suggestions from real project nodes
    const components = nodes.filter((n: any) => n.type === 'custom') || [];
    if (components.length > 0) {
      const shuffled = [...components].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      const prompts = selected.map((n, i) => {
        if (i === 0) return `What is the purpose of ${n.data.label}?`;
        if (i === 1) return `Tell me about ${n.data.path}`;
        if (i === 2) return `How does ${n.data.label} fit in?`;
        return `Explain the ${n.data.type} logic here.`;
      });
      setSuggestions(prompts);
    }
  }, [nodes]);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      const prompt = e.detail.prompt;
      setQuery(prompt);
      handleSearch(prompt);
    };

    window.addEventListener('trigger-refactor-review', handleTrigger);
    return () => window.removeEventListener('trigger-refactor-review', handleTrigger);
  }, [nodes]);

  const getFocusIcon = (focus: string) => {
    switch(focus) {
      case 'security': return <Shield className="w-3 h-3" />;
      case 'performance': return <Zap className="w-3 h-3" />;
      default: return <Cpu className="w-3 h-3" />;
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;

    if (onSearch) {
      onSearch(activeQuery);
    }

    setLoading(true);
    // Simulate AI response based on current components
    setTimeout(() => {
      const match = nodes.find(n => 
        activeQuery.toLowerCase().includes(n.data.label.toLowerCase()) || 
        activeQuery.toLowerCase().includes(n.data.type.toLowerCase())
      );

      if (match) {
        setAiResponse(`The ${match.data.label} is a ${match.data.type} located at ${match.data.path}. It is a core part of the architectural layer and interacts with related modules to ensure system stability.`);
      } else {
        setAiResponse("Based on the current architecture scan, I couldn't find a direct match for that query. Try asking about a specific component or layer shown in the graph.");
      }
      setLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          AI Oracle
        </label>
        <div className="flex gap-1.5">
          {settings && (
            <>
              <Select
                value={settings.ai.focus}
                onValueChange={(val: any) => updateSettings({ ai: { ...settings.ai, focus: val } })}
              >
                <SelectTrigger className="h-6 w-6 p-0 border-primary/20 bg-primary/5 text-primary rounded-md focus:ring-0 focus:ring-offset-0 [&>svg]:hidden flex items-center justify-center transition-colors hover:bg-primary/10">
                  <span className="flex items-center justify-center">
                    {getFocusIcon(settings.ai.focus)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architecture" className="text-xs">Architecture</SelectItem>
                  <SelectItem value="security" className="text-xs">Security</SelectItem>
                  <SelectItem value="performance" className="text-xs">Performance</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={settings.ai.insightDepth}
                onValueChange={(val: any) => updateSettings({ ai: { ...settings.ai, insightDepth: val } })}
              >
                <SelectTrigger className="h-6 w-6 p-0 border-border/50 bg-secondary/50 text-muted-foreground rounded-md focus:ring-0 focus:ring-offset-0 [&>svg]:hidden flex items-center justify-center transition-colors hover:bg-secondary/80">
                  <span className="flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise" className="text-xs">Concise</SelectItem>
                  <SelectItem value="detailed" className="text-xs">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ask about the architecture..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-input border-border text-sm h-10"
          />
        </div>
        <Button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2 h-10 shadow-lg shadow-primary/20"
        >
          {loading ? 'Analyzing...' : 'Ask Bob'}
          <Send className="w-3.5 h-3.5" />
        </Button>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s);
                  handleSearch(s);
                }}
                className="w-fit text-left text-[10px] px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/50 transition-all"
              >
                {s}
              </button>
            ))
          )}
        </div>
      </div>

      {aiResponse && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Oracle Analysis:</p>
          <p className="text-xs text-foreground/90 leading-relaxed italic">"{aiResponse}"</p>
        </div>
      )}
    </div>
  );
}
