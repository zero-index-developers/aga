import { Node, Edge } from './types';

export function calculateHealthScore(nodes: Node[], edges: Edge[]): number {
  if (nodes.length === 0) return 100;

  const incomingEdges = new Map<string, number>();
  const outgoingEdges = new Map<string, number>();

  // Initialize all custom nodes
  nodes.forEach(node => {
    if (node.type === 'custom') {
      incomingEdges.set(node.id, 0);
      outgoingEdges.set(node.id, 0);
    }
  });

  // Count edges
  edges.forEach(edge => {
    if (incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, incomingEdges.get(edge.target)! + 1);
    }
    if (outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, outgoingEdges.get(edge.source)! + 1);
    }
  });

  let deadCodePenalty = 0;

  nodes.forEach(node => {
    if (node.type === 'custom') {
      const isEntryPoint = node.data.type === 'page' || node.data.type === 'api';
      const inCount = incomingEdges.get(node.id) || 0;
      
      // If a non-entrypoint file has no incoming edges, it might be dead code
      if (!isEntryPoint && inCount === 0) {
        deadCodePenalty += 2; // Deduct 2 points per potential dead code file
      }
    }
  });

  // Base score 100, minimum score 0
  return Math.max(0, 100 - deadCodePenalty);
}
