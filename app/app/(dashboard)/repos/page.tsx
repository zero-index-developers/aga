"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { ConnectRepoDialog } from "@/components/connect-repo-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useRepos } from "@/hooks/use-repos";
import { RepositoryCard } from "@/components/repository-card";
import { FolderGit2 } from "lucide-react";

export default function RepositoriesPage() {
  const router = useRouter();
  const { repos, connectedRepo, isLoading, refreshRepos, switchRepo } = useRepos();

  async function handleLoadRepo(repoName: string, url: string) {
    const success = await switchRepo(repoName, url);
    if (success) {
      router.push(`/?repo=${encodeURIComponent(repoName)}`);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground min-w-0">
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">Repositories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <ConnectRepoDialog onSuccess={refreshRepos} />
        </div>
      </Header>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Repository Management</h1>
            <p className="text-muted-foreground text-sm">Analyze and manage your connected codebases.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo) => (
                <RepositoryCard
                  key={repo.name}
                  repo={repo}
                  isActive={connectedRepo === repo.name}
                  onClick={() => handleLoadRepo(repo.name, repo.url)}
                />
              ))}
              
              {repos.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                  <FolderGit2 className="w-12 h-12 text-muted-foreground/30" />
                  <div>
                    <h3 className="font-semibold">No repositories connected</h3>
                    <p className="text-sm text-muted-foreground">Get started by connecting your first repository.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
