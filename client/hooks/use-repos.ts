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
      const data = await res.json();
      
      // Handle error responses or ensure data is an array
      if (Array.isArray(data)) {
        setRepos(data);
      } else if (data.error) {
        console.error('Backend error:', data.error);
        setRepos([]); // Set empty array on error
        
        // Provide helpful error message based on error type
        if (data.error.includes('Authentication required')) {
          // Don't show toast for auth errors on initial load - user might not be logged in yet
          console.log('Authentication required - user needs to log in');
        } else if (data.error.includes('Failed to connect to backend')) {
          toast.error('Backend not running. Start Laravel: cd api && php artisan serve');
        } else {
          toast.error(data.error);
        }
      } else {
        console.error('Unexpected response format:', data);
        setRepos([]);
      }
    } catch (error) {
      console.error('Failed to fetch repos:', error);
      setRepos([]); // Set empty array on error
      toast.error('Failed to fetch repositories');
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
        await fetchRepos(); // Refresh list to get updated analytics if any
        return true;
      }
    } catch (error) {
      toast.error("Failed to switch repository.");
    }
    return false;
  };

  const deleteRepo = async (repoName: string) => {
    try {
      const res = await fetch(`/api/repo/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName }),
      });
      const data = await res.json();
      if (data.success) {
        // If we deleted the currently connected repo, clear it
        if (connectedRepo === repoName) {
          setConnectedRepo(null);
        }
        await fetchRepos(); // Refresh list
        toast.success(`Repository "${repoName}" deleted successfully`);
        return true;
      } else {
        toast.error(data.error || "Failed to delete repository");
      }
    } catch (error) {
      toast.error("Failed to delete repository");
      console.error('Delete error:', error);
    }
    return false;
  };

  return {
    repos,
    connectedRepo,
    isLoading,
    refreshRepos: fetchRepos,
    switchRepo,
    deleteRepo
  };
}
