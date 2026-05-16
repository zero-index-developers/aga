"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ArchitectureVisualization from '@client/components/architecture-visualization';
import SearchPanel from '@client/components/search-panel';
import DependencyPanel from '@client/components/dependency-panel';
import Header from '@client/components/header';
import { Button } from '@client/components/ui/button';
import { RefreshCw, Activity, Network as NetworkIcon, Box, X } from 'lucide-react';
import { toast } from 'sonner';
import { DynamicBreadcrumbs } from '@client/components/dynamic-breadcrumbs';
import { useRepos } from '@client/hooks/use-repos';
import { useGlobalStats } from '@client/hooks/use-global-stats';
import { WelcomeBanner } from '@client/components/welcome-banner';
import { StatsCard } from '@client/components/stats-card';
import { RepositoryCard } from '@client/components/repository-card';
import { useSidebar } from '@client/components/ui/sidebar';
import { slugify } from '@client/lib/utils';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRepoParam = searchParams.get('repo');

  const { repos, connectedRepo, isLoading, refreshRepos, switchRepo } = useRepos();
  const globalStats = useGlobalStats(repos);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setOpen } = useSidebar();
  const hasCollapsed = useRef(false);

  useEffect(() => {
    if (activeRepoParam) {
      router.replace(`/repos/${slugify(activeRepoParam)}`);
    }
  }, [activeRepoParam, router]);

  useEffect(() => {
    if (activeRepoParam && !hasCollapsed.current) {
      // Small delay to ensure sidebar is mounted
      setTimeout(() => {
        setOpen(false);
        hasCollapsed.current = true;
      }, 0);
    }
  }, [activeRepoParam, setOpen]);

  const handleOpenRepo = async (name: string, url: string) => {
    const success = await switchRepo(name, url);
    if (success) {
      router.push(`/repos/${slugify(name)}`);
    }
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
        <DynamicBreadcrumbs />
      </Header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <WelcomeBanner
            connectedRepo={connectedRepo}
            onOpenRecent={() => router.push(`/repos/${encodeURIComponent(connectedRepo!)}`)}
            onOpenSample={() => handleOpenRepo('aga (Self-Scan)', 'local://aga')}
            onConnectSuccess={refreshRepos}
          />

          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Global Architecture Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="Active Repos" value={globalStats.totalRepos} description="Connected to local-db" icon={NetworkIcon} />
              <StatsCard title="Total Components" value={globalStats.totalNodes} description="Across all environments" icon={Box} />
              <StatsCard title="Total Dependencies" value={globalStats.totalEdges} description="System-wide links" icon={NetworkIcon} />
              <StatsCard title="Global Health" value={`${globalStats.avgHealth}%`} description="Weighted average" icon={Activity} trendColor="text-primary" />
            </div>
          </section>

          <section className="space-y-4 pb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Architecture Scans</h3>
              <Button variant="link" onClick={() => router.push('/repos')} className="text-primary text-xs p-0 h-auto">
                View All Repositories
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {repos.slice(0, 3).map((repo) => (
                <RepositoryCard
                  key={repo.name}
                  repo={repo}
                  isActive={connectedRepo === repo.name}
                  onClick={() => handleOpenRepo(repo.name, repo.url)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading AGA Console...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
