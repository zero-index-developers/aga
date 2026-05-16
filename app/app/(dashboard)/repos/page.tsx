"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FolderGit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { ConnectRepoDialog } from "@/components/connect-repo-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import { useState, useEffect } from "react";

export default function RepositoriesPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch('/api/repo/list');
        const data = await res.json();
        setRepos(data);
      } catch (error) {
        console.error('Failed to fetch repos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRepos();
  }, []);

  async function handleLoadRepo(repoName: string, url: string) {
    try {
      await fetch('/api/repo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, repoName }),
      });
      router.push(`/?repo=${encodeURIComponent(repoName)}`);
    } catch (error) {
      console.error('Failed to load repo:', error);
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
          <ConnectRepoDialog onSuccess={() => {
            fetch('/api/repo/list').then(r => r.json()).then(setRepos);
          }} />
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
                <div key={repo.name} onClick={() => handleLoadRepo(repo.name, repo.url)}>
                  <Card className="flex flex-col cursor-pointer hover:border-primary/50 transition-all hover:shadow-md bg-card/30 h-full group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                          <FolderGit2 className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {repo.url}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                        <span>Last scanned: {repo.analytics?.lastScanned ? new Date(repo.analytics.lastScanned).toLocaleDateString() : 'Never'}</span>
                        <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Graph &rarr;</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* If no repos, show a prompt or empty state */}
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
