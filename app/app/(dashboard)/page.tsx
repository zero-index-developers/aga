"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ArchitectureVisualization from '@/components/architecture-visualization';
import SearchPanel from '@/components/search-panel';
import DependencyPanel from '@/components/dependency-panel';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Network as NetworkIcon, Box, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRepos } from '@/hooks/use-repos';
import { WelcomeBanner } from '@/components/welcome-banner';
import { StatsCard } from '@/components/stats-card';
import { RepositoryCard } from '@/components/repository-card';
import { useSidebar } from '@/components/ui/sidebar';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRepoParam = searchParams.get('repo');


  const { repos, connectedRepo, isLoading, refreshRepos, switchRepo } = useRepos();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencies, setShowDependencies] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { setOpen, open } = useSidebar();

  const hasCollapsed = useRef(false);

  useEffect(() => {
    if (activeRepoParam && !hasCollapsed.current) {
      // Small delay to ensure sidebar is mounted
      setTimeout(() => {
        setOpen(false);
        hasCollapsed.current = true;
      }, 0);
    }
  }, [activeRepoParam, setOpen]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success('Repository successfully scanned and updated!');
  }

  const handleOpenRepo = async (name: string, url: string) => {
    const success = await switchRepo(name, url);
    if (success) {
      router.push(`/?repo=${encodeURIComponent(name)}`);
    }
  };

  // Calculate Global Stats
  const globalStats = {
    totalRepos: repos.length,
    totalNodes: repos.reduce((acc, r) => acc + (r.analytics?.nodes || 0), 0),
    totalEdges: repos.reduce((acc, r) => acc + (r.analytics?.edges || 0), 0),
    avgHealth: repos.length > 0
      ? Math.round(repos.reduce((acc, r) => acc + (r.analytics?.health || 0), 0) / repos.length)
      : 0
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading AGA Console...</p>
      </div>
    );
  }

  const showGraph = !!activeRepoParam && connectedRepo === activeRepoParam;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground min-w-0">
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={showGraph ? "/repos" : "/"}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(showGraph ? "/repos" : "/");
                }}
                className="cursor-pointer"
              >
                {showGraph ? 'Repositories' : 'Overview'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {showGraph && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">{connectedRepo}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {connectedRepo && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 ml-auto shrink-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        )}
      </Header>

      {showGraph ? (
        <div className="flex-1 flex overflow-hidden min-h-0">
          <aside className="w-80 border-r border-border/50 bg-card/30 overflow-y-auto hidden lg:block shrink-0">
            <SearchPanel
              onSearch={setSearchQuery}
              onNodeSelect={setSelectedNode}
            />
          </aside>
          <main className="flex-1 relative bg-slate-950/20 overflow-hidden min-w-0">
            <ArchitectureVisualization
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
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <WelcomeBanner
            connectedRepo={connectedRepo}
            onOpenRecent={() => router.push(`/?repo=${encodeURIComponent(connectedRepo!)}`)}
            onOpenSample={() => handleOpenRepo('facebook/react (Sample)', 'https://github.com/facebook/react')}
            onConnectSuccess={refreshRepos}
          />

          <div className="max-w-5xl mx-auto w-full space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Global Architecture Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Active Repos" value={globalStats.totalRepos} description="Connected to local-db" icon={NetworkIcon} />
              <StatsCard title="Total Components" value={globalStats.totalNodes} description="Across all environments" icon={Box} />
              <StatsCard title="Total Dependencies" value={globalStats.totalEdges} description="System-wide links" icon={NetworkIcon} />
              <StatsCard title="Global Health" value={`${globalStats.avgHealth}%`} description="Weighted average" icon={Activity} trendColor="text-primary" />
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full space-y-4">
            <h3 className="text-lg font-semibold">Your Repositories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12 items-start">
              {repos.map((repo) => (
                <RepositoryCard
                  key={repo.name}
                  repo={repo}
                  isActive={connectedRepo === repo.name}
                  onClick={() => handleOpenRepo(repo.name, repo.url)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
