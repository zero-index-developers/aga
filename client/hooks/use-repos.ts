import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { Repository } from '@client/lib/types';

export function useRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRepos = useCallback(async () => {
    try {
      const res = await fetch('/api/repo/list');
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch repositories');
      }

      setRepos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
      setRepos([]);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/repo/status');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch repository status');
      }

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
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to switch repository');
      }

      if (data.success) {
        setConnectedRepo(repoName);
        await fetchRepos(); // Refresh list to get updated analytics if any
        return true;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to switch repository.");
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
