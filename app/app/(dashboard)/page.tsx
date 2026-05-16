'use client';

import { useState } from 'react';
import ArchitectureVisualization from '@/components/architecture-visualization';
import SearchPanel from '@/components/search-panel';
import DependencyPanel from '@/components/dependency-panel';
import Header from '@/components/header';
import { ConnectRepoDialog } from '@/components/connect-repo-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderGit2, RefreshCw, Activity, Network as NetworkIcon, Box, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencies, setShowDependencies] = useState(false);

  // Mock State
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    // Simulate scan/refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success('Repository successfully scanned and updated!');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onConnect={setConnectedRepo} />

      {!connectedRepo ? (
        // --- EMPTY STATE ---
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="p-6 bg-muted rounded-full">
            <FolderGit2 className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">No Repository Connected</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Connect a GitHub or GitLab repository to start analyzing your software architecture and dependencies.
            </p>
          </div>
          <div className="pt-4">
            <ConnectRepoDialog onSuccess={setConnectedRepo} />
          </div>
        </div>
      ) : (
        // --- ANALYTICS & DASHBOARD STATE ---
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Analytics Header Row */}
          <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderGit2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight">{connectedRepo}</h2>
            </div>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Scanning Commits...' : 'Scan / Refresh Commits'}
            </Button>
          </div>

          {/* Analytics Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 border-b border-border">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Components</CardTitle>
                <Box className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">+4 from last scan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dependencies</CardTitle>
                <NetworkIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">315</div>
                <p className="text-xs text-muted-foreground">+12 from last scan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">92%</div>
                <p className="text-xs text-muted-foreground">2 isolated components</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Scanned</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Just now</div>
                <p className="text-xs text-muted-foreground">Sync is active</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Graph Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
              <SearchPanel onSearch={setSearchQuery} onNodeSelect={setSelectedNode} />
            </div>

            {/* Graph Visualization */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              <ArchitectureVisualization
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
                onShowDependencies={setShowDependencies}
              />
            </div>

            {/* Right Panel */}
            {selectedNode && showDependencies && (
              <div className="w-80 border-l border-border bg-card shrink-0 overflow-y-auto">
                <DependencyPanel nodeId={selectedNode} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
