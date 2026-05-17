"use client";

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ArchitectureVisualization from '@client/components/architecture/architecture-visualization';
import SearchPanel from '@client/components/architecture/search-panel';
import DependencyPanel from '@client/components/architecture/dependency-panel';
import { HeaderActions } from '@client/components/layout/header-actions';
import { Button } from '@client/components/ui/button';
import { RefreshCw, X, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRepos } from '@client/hooks/use-repos';
import { useArchitectureData } from '@client/hooks/use-architecture-data';
import { slugify } from '@client/lib/utils';

export default function RepositoryGraphPage({ params }: { params: Promise<{ name: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const repoSlug = decodeURIComponent(resolvedParams.name);

  const { repos, isLoading: isReposLoading } = useRepos();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencies, setShowDependencies] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);

  // Find the actual repo name from the slug
  const actualRepo = repos.find(r => slugify(r.name) === repoSlug);
  const repoName = actualRepo?.name || repoSlug;

  const {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    initialNodes,
    isLoading: isGraphLoading,
    refreshGraph
  } = useArchitectureData(repoName);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/repo/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoName,
          url: actualRepo?.url,
          provider: actualRepo?.provider,
        }),
      });

      if (!res.ok) {
        throw new Error('Scan failed');
      }

      await refreshGraph();
      toast.success('Repository successfully scanned and updated!');
    } catch (error) {
      toast.error('Repository scan failed.');
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isReposLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground overflow-hidden">
      <HeaderActions>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => router.push('/repos')}
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
      </HeaderActions>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="w-80 border-r border-border/50 bg-card/30 backdrop-blur-xl overflow-y-auto hidden lg:block shrink-0">
          <SearchPanel
            onSearch={setSearchQuery}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode}
            nodes={nodes}
            isLoading={isGraphLoading}
            onOracleResponse={setOracleResponse}
          />
        </aside>
        <main className="flex-1 relative bg-slate-950/20 overflow-hidden min-w-0">
          {oracleResponse && (
            <div className="absolute top-6 left-6 z-50 max-w-sm w-full bg-background/60 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 p-5 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-primary/10 rounded-lg">
                    <RefreshCw className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Oracle Analysis
                  </span>
                </div>
                <button
                  onClick={() => setOracleResponse(null)}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                {oracleResponse}
              </p>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">
                  bob-v1.0.4-stable
                </span>
              </div>
            </div>
          )}

          <ArchitectureVisualization
            repoName={repoName}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onShowDependencies={setShowDependencies}
            initialNodes={initialNodes}
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
            isLoading={isGraphLoading}

          />
        </main>
        {showDependencies && selectedNode && (
          <aside className="w-80 border-l border-border/50 bg-card/40 overflow-y-auto relative shrink-0">
            <button
              onClick={() => setShowDependencies(false)}
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-md transition-colors z-50 bg-background/50 backdrop-blur-sm border border-border/50"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <DependencyPanel nodeId={selectedNode} />
          </aside>
        )}
      </div>
    </div>
  );
}
