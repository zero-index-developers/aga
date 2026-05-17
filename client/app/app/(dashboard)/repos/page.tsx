"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { RepositoryCard } from '@client/components/dashboard/repository-card';
import { useRepos } from '@client/hooks/use-repos';
import { Activity, Plus, RefreshCw, Library } from 'lucide-react';
import { slugify } from '@client/lib/utils';
import { ConnectRepoDialog } from '@client/components/dashboard/connect-repo-dialog';
import { PageHeader } from '@client/components/layout/page-header';
import { Button } from '@client/components/ui/button';
import { toast } from 'sonner';

export default function RepositoriesPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    <div className="flex-1 flex flex-col bg-background text-foreground overflow-hidden">

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <PageHeader
            title="Repository Library"
            description="Manage and explore your connected architectural scans."
            icon={Library}
            actions={
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl h-10">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{repos.length} Total Systems</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-10"
                  onClick={async () => {
                    setIsRefreshing(true);
                    await refreshRepos();
                    setIsRefreshing(false);
                    toast.success('Repository library updated!');
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <ConnectRepoDialog onSuccess={refreshRepos} />
              </>
            }
          />

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
    </div>
  );
}
