'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Box, FileCode, Database, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export default function SearchPanel({ onSearch, onNodeSelect, selectedNodeId }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await fetch('/api/repo/graph');
        const data = await res.json();
        setNodes(data.nodes?.filter((n: any) => n.type === 'custom') || []);
      } catch (e) {
        console.error('Failed to fetch nodes for search', e);
      }
    };
    fetchNodes();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    // Simulate AI response based on current components
    setTimeout(() => {
      const match = nodes.find(n => 
        query.toLowerCase().includes(n.data.label.toLowerCase()) || 
        query.toLowerCase().includes(n.data.type.toLowerCase())
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
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="space-y-4">
        {/* Contextual Oracle Search */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Contextual Oracle
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ask about the architecture..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-input border-border text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2"
              size="sm"
            >
              {loading ? 'Analyzing...' : 'Ask Bob'}
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

          {aiResponse && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-xs font-semibold text-accent mb-2">Oracle Response:</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Architecture Explorer */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Components
          </label>
          <div className="space-y-1.5">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium border border-transparent ${
                  selectedNodeId === node.id
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                    : 'hover:bg-secondary/50 text-foreground/80 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      node.data.type === 'component'
                        ? 'bg-blue-500'
                        : node.data.type === 'page'
                          ? 'bg-purple-500'
                          : node.data.type === 'api'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                    }`}
                  ></div>
                  <span className="flex-1 truncate">{node.data.label}</span>
                </div>
              </button>
            ))}
            {nodes.length === 0 && (
              <div className="text-[11px] text-muted-foreground italic text-center py-4">
                No components detected in this view.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
