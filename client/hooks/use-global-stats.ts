"use client";

import { useMemo } from 'react';

import { Repository } from '@client/lib/types';

export function useGlobalStats(repos: Repository[]) {
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
