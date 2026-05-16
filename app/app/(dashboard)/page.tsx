'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ArchitectureVisualization from '@/components/architecture-visualization';
import SearchPanel from '@/components/search-panel';
import DependencyPanel from '@/components/dependency-panel';
import Header from '@/components/header';
import { ConnectRepoDialog } from '@/components/connect-repo-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderGit2, RefreshCw, Activity, Network as NetworkIcon, Box, Clock, Github, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRepoParam = searchParams.get('repo');

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencies, setShowDependencies] = useState(false);

  // Mock State
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    nodes: 0,
    edges: 0,
    health: 0,
    lastScanned: null as string | null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allRepos, setAllRepos] = useState<any[]>([]);

  // Fetch status and list on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, listRes] = await Promise.all([
          fetch('/api/repo/status'),
          fetch('/api/repo/list')
        ]);

        const statusData = await statusRes.json();
        const listData = await listRes.json();

        if (statusData.connectedRepo) {
          setConnectedRepo(statusData.connectedRepo);
          setAnalytics(statusData.analytics);
        }
        setAllRepos(listData);

        // If repo param exists but doesn't match connectedRepo, we might want to switch
        if (activeRepoParam && activeRepoParam !== statusData.connectedRepo) {
          const repoToSwitch = listData.find((r: any) => r.name === activeRepoParam);
          if (repoToSwitch) {
            // Silently switch for consistency
            fetch('/api/repo/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: repoToSwitch.url, repoName: repoToSwitch.name }),
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [activeRepoParam]);

  async function handleRefresh() {
    setIsRefreshing(true);
    // Simulate scan/refresh via API later, for now just update locally
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newAnalytics = {
      ...analytics,
      nodes: analytics.nodes + Math.floor(Math.random() * 5),
      edges: analytics.edges + Math.floor(Math.random() * 10),
      lastScanned: new Date().toISOString()
    };

    setAnalytics(newAnalytics);
    setIsRefreshing(false);
    toast.success('Repository successfully scanned and updated!');
  }

  async function switchRepo(repoName: string, url: string, navigateToGraph = false) {
    try {
      const res = await fetch('/api/repo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, repoName }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectedRepo(data.db.connectedRepo);
        setAnalytics(data.db.analytics);
        toast.success(`Switched to ${repoName}`);

        if (navigateToGraph) {
          router.push(`/?repo=${encodeURIComponent(repoName)}`);
        }
      }
    } catch (error) {
      toast.error("Failed to switch repository.");
    }
  }

  // Calculate Global Stats
  const globalStats = {
    totalRepos: allRepos.length,
    totalNodes: allRepos.reduce((acc, r) => acc + (r.analytics?.nodes || 0), 0),
    totalEdges: allRepos.reduce((acc, r) => acc + (r.analytics?.edges || 0), 0),
    avgHealth: allRepos.length > 0
      ? Math.round(allRepos.reduce((acc, r) => acc + (r.analytics?.health || 0), 0) / allRepos.length)
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

  // Determine if we show the graph or the overview
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
            <span className="hidden sm:inline">{isRefreshing ? 'Scanning...' : 'Scan / Refresh'}</span>
          </Button>
        )}
      </Header>

      {showGraph ? (
        // --- GRAPH VIEW ---
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
        // --- OVERVIEW DASHBOARD ---
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* --- WELCOME BANNER (Always Visible) --- */}
          <div className="max-w-5xl mx-auto w-full space-y-6 pt-4">
            <div className="text-left space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to AGA</h1>
              <p className="text-muted-foreground text-lg">
                Google Maps for Software Architecture. Connect repositories to visualize their architecture and analyze dependencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="flex flex-col border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <FolderGit2 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Connect Your Repository</CardTitle>
                  <CardDescription className="text-sm">
                    Import from GitHub or GitLab to analyze your own codebase.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <ConnectRepoDialog onSuccess={(name) => {
                    setConnectedRepo(name);
                    fetch('/api/repo/list').then(r => r.json()).then(setAllRepos);
                  }} />
                </CardContent>
              </Card>

              <Card className="flex flex-col border-border/50 bg-card/30 hover:bg-card/50 transition-colors border-dashed">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                    {connectedRepo ? <Clock className="w-5 h-5 text-primary" /> : <Github className="w-5 h-5 text-foreground" />}
                  </div>
                  <CardTitle className="text-lg">
                    {connectedRepo ? 'Recent Repository' : 'Explore Sample'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {connectedRepo
                      ? `Jump back into your last analyzed project: ${connectedRepo}`
                      : 'Open facebook/react to see how the architecture graph works.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (connectedRepo) {
                        router.push(`/?repo=${encodeURIComponent(connectedRepo)}`);
                      } else {
                        switchRepo('facebook/react (Sample)', 'https://github.com/facebook/react', true);
                      }
                    }}
                  >
                    {connectedRepo ? `Open ${connectedRepo}` : 'Open Sample Repo'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- GLOBAL ANALYTICS --- */}
          <div className="max-w-5xl mx-auto w-full space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Global Architecture Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/40 border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Repos</CardTitle>
                  <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.totalRepos}</div>
                  <p className="text-xs text-muted-foreground">Connected to local-db</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Components</CardTitle>
                  <Box className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.totalNodes}</div>
                  <p className="text-xs text-muted-foreground">Across all environments</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Dependencies</CardTitle>
                  <NetworkIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.totalEdges}</div>
                  <p className="text-xs text-muted-foreground">System-wide links</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Global Health</CardTitle>
                  <Activity className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{globalStats.avgHealth}%</div>
                  <p className="text-xs text-muted-foreground">Weighted average</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- REPOSITORY SELECTOR --- */}
          <div className="max-w-5xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Repositories</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12 items-start">
              {allRepos.map((repo) => (
                <Card
                  key={repo.name}
                  className={`cursor-pointer transition-all hover:border-primary/50 group bg-card/20 shadow-sm hover:shadow-md ${connectedRepo === repo.name ? 'border-primary bg-primary/5' : 'border-border/40'}`}
                  onClick={() => switchRepo(repo.name, repo.url, true)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 truncate">
                        <FolderGit2 className={`w-5 h-5 shrink-0 ${connectedRepo === repo.name ? 'text-primary' : 'text-muted-foreground'}`} />
                        <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                      </div>
                      {connectedRepo === repo.name && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
