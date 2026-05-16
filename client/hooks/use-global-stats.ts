"use client";

import { useMemo } from 'react';

interface Repo {
  name: string;
  url: string;
  analytics?: {
    nodes?: number;
    edges?: number;
    health?: number;
  };
}

export function useGlobalStats(repos: Repo[]) {
  const stats = useMemo(() => {
    return {
      totalRepos: repos.length,
      totalNodes: repos.reduce((acc, r) => acc + (r.analytics?.nodes || 0), 0),
      totalEdges: repos.reduce((acc, r) => acc + (r.analytics?.edges || 0), 0),
      avgHealth: repos.length > 0
        ? Math.round(repos.reduce((acc, r) => acc + (r.analytics?.health || 0), 0) / repos.length)
        : 0
    };
  }, [repos]);

  return stats;
}
