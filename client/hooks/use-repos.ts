import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Repository {
  name: string;
  url: string;
  provider?: string;
  analytics?: {
    nodes: number;
    edges: number;
    health: number;
    lastScanned: string | null;
  };
}

export function useRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRepos = useCallback(async () => {
    try {
      const res = await fetch('/api/repo/list');
      const data = await res.json();
      setRepos(data);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/repo/status');
      const data = await res.json();
      if (data.connectedRepo) {
        setConnectedRepo(data.connectedRepo);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([fetchRepos(), fetchStatus()]);
      setIsLoading(false);
    }
    init();
  }, [fetchRepos, fetchStatus]);

  const switchRepo = async (repoName: string, url: string) => {
    try {
      const res = await fetch('/api/repo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, repoName }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectedRepo(repoName);
        toast.success(`Switched to ${repoName}`);
        await fetchRepos(); // Refresh list to get updated analytics if any
        return true;
      }
    } catch (error) {
      toast.error("Failed to switch repository.");
    }
    return false;
  };

  return {
    repos,
    connectedRepo,
    isLoading,
    refreshRepos: fetchRepos,
    switchRepo
  };
}
