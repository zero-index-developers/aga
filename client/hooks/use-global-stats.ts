"use client";

import { useMemo } from 'react';

import { Repository } from '@client/lib/types';

export function useGlobalStats(repos: Repository[]) {
  const stats = useMemo(() => {
    // Safety check: ensure repos is an array
    const repoArray = Array.isArray(repos) ? repos : [];
    
    return {
      totalRepos: repoArray.length,
      totalNodes: repoArray.reduce((acc, r) => acc + (r.analytics?.nodes || 0), 0),
      totalEdges: repoArray.reduce((acc, r) => acc + (r.analytics?.edges || 0), 0),
      avgHealth: repoArray.length > 0
        ? Math.round(repoArray.reduce((acc, r) => acc + (r.analytics?.health || 0), 0) / repoArray.length)
        : 0
    };
  }, [repos]);

  return stats;
}
