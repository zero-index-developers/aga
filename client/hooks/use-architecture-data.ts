import { useState, useEffect, useRef, useCallback } from 'react';
import { useNodesState, useEdgesState, Node, Edge } from 'reactflow';

export function useArchitectureData(repoName: string) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const initialNodesRef = useRef<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGraph = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use cache-busting to ensure we get fresh data
      const res = await fetch(`/api/repo/graph?repo=${encodeURIComponent(repoName)}&_t=${Date.now()}`);
      const data = await res.json();
      
      const rawNodes = (data.nodes || []).map((n: Node) => ({
        ...n,
        data: {
          ...n.data,
          origX: n.data.origX ?? n.position.x,
          origY: n.data.origY ?? n.position.y,
          origWidth: n.data.origWidth ?? n.style?.width,
          origHeight: n.data.origHeight ?? n.style?.height,
        }
      }));

      // Disambiguate duplicate labels by prepending parent folder
      const componentNodes = rawNodes.filter((n: Node) => !n.id.startsWith('group-'));
      const labelCounts = new Map<string, number>();
      for (const n of componentNodes) {
        const lbl = n.data.label as string;
        labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + 1);
      }

      const capitalize = (s: string) =>
        s.replace(/(?:^|[-_/])(\w)/g, (_, c) => ` ${c.toUpperCase()}`).trim();

      const fetchedNodes = rawNodes.map((n: Node) => {
        if (n.id.startsWith('group-')) return n;

        let label = n.data.label as string;
        if (labelCounts.get(label)! > 1 && n.data.path) {
          const parts = (n.data.path as string).split('/');
          if (parts.length >= 2) {
            label = `${parts[parts.length - 2]}/${label}`;
          }
        }

        return {
          ...n,
          data: { ...n.data, label: capitalize(label) },
        };
      });

      setNodes(fetchedNodes);
      initialNodesRef.current = fetchedNodes;
      setEdges(data.edges || []);
    } catch (error) {
      console.error('Failed to fetch graph:', error);
    } finally {
      setIsLoading(false);
    }
  }, [repoName, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    initialNodes: initialNodesRef.current,
    isLoading,
    refreshGraph: fetchGraph
  };
}
