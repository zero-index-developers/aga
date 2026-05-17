import { walkDirectory } from './scanner/file-walker';
import { buildGraph } from './scanner/graph-builder';
import { applyGridLayout } from './scanner/layout-engine';
import { calculateHealthScore } from './scanner/health-analyzer';
import { ScanOptions } from './scanner/types';

export async function scanProject(rootPath: string, options: ScanOptions = {}) {
  const exclusions = options.exclusions || [];

  // Phase 1 & 2: Discover and filter files
  const filePaths = await walkDirectory(rootPath, rootPath, exclusions);

  // Phase 3 & 4: Classify files, resolve dependencies, and build graph
  const { nodes, edges } = await buildGraph(filePaths, rootPath);

  // Phase 5: Position nodes dynamically
  applyGridLayout(nodes);

  // Phase 6: Analyze graph metrics
  const healthScore = calculateHealthScore(nodes, edges);

  return { 
    nodes, 
    edges,
    healthScore
  };
}
