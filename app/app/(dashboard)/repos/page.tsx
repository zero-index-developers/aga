"use client";

import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { DynamicBreadcrumbs } from '@/components/dynamic-breadcrumbs';
import { RepositoryCard } from '@/components/repository-card';
import { useRepos } from '@/hooks/use-repos';
import { Activity, Plus } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { ConnectRepoDialog } from '@/components/connect-repo-dialog';

export default function RepositoriesPage() {
  const router = useRouter();
  const { repos, connectedRepo, isLoading, switchRepo, refreshRepos } = useRepos();

  const handleOpenRepo = async (name: string, url: string) => {
    const success = await switchRepo(name, url);
    if (success) {
      router.push(`/repos/${slugify(name)}`);
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

      <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repository Library</h1>
            <p className="text-muted-foreground mt-1">Manage and explore your connected architectural scans.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl h-10">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{repos.length} Total Systems</span>
            </div>
            <ConnectRepoDialog onSuccess={refreshRepos} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
