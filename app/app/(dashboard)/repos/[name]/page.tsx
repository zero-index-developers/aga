"use client";

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ArchitectureVisualization from '@/components/architecture-visualization';
import SearchPanel from '@/components/search-panel';
import DependencyPanel from '@/components/dependency-panel';
import Header from '@/components/header';
import { DynamicBreadcrumbs } from '@/components/dynamic-breadcrumbs';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRepos } from '@/hooks/use-repos';

export default function RepositoryGraphPage({ params }: { params: Promise<{ name: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const repoName = decodeURIComponent(resolvedParams.name);
  
  const { connectedRepo, isLoading, refreshRepos } = useRepos();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencies, setShowDependencies] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshRepos();
    setIsRefreshing(false);
    toast.success('Repository successfully scanned and updated!');
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header>
        <DynamicBreadcrumbs />

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Scan</span>
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
        </div>
      </Header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className="w-80 border-r border-border/50 bg-card/30 overflow-y-auto hidden lg:block shrink-0">
          <SearchPanel
            onSearch={setSearchQuery}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode}
          />
        </aside>
        <main className="flex-1 relative bg-slate-950/20 overflow-hidden min-w-0">
          <ArchitectureVisualization
            repoName={repoName}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onShowDependencies={setShowDependencies}
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
