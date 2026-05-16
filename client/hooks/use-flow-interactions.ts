import { useEffect } from 'react';
import { useReactFlow, Node, Edge } from 'reactflow';

interface UseFlowInteractionsProps {
  selectedNode: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onShowDependencies: (show: boolean) => void;
}

export function useFlowInteractions({
  selectedNode,
  setNodes,
  setEdges,
  onShowDependencies,
}: UseFlowInteractionsProps) {
  const { setCenter, getNodes, getEdges } = useReactFlow();

  // Highlight Logic
  useEffect(() => {
    if (!selectedNode) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isSelected: false, isRelated: false, isAnySelected: false },
        }))
      );
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));
      return;
    }

    setNodes((nds) => {
      const currentEdges = getEdges();
      const relatedNodeIds = new Set<string>([selectedNode]);

      // Calculate related nodes using current edges
      const findUpstream = (nodeId: string) => {
        currentEdges.forEach((edge) => {
          if (edge.target === nodeId && !relatedNodeIds.has(edge.source)) {
            relatedNodeIds.add(edge.source);
            findUpstream(edge.source);
          }
        });
      };

      const findDownstream = (nodeId: string) => {
        currentEdges.forEach((edge) => {
          if (edge.source === nodeId && !relatedNodeIds.has(edge.target)) {
            relatedNodeIds.add(edge.target);
            findDownstream(edge.target);
          }
        });
      };

      findUpstream(selectedNode);
      findDownstream(selectedNode);

      return nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === selectedNode,
          isRelated: relatedNodeIds.has(n.id),
          isAnySelected: true,
        },
      }));
    });

    setEdges((eds) => {
      return eds.map((e) => ({
        ...e,
        animated: e.source === selectedNode || e.target === selectedNode,
      }));
    });
  }, [selectedNode, setNodes, setEdges, getEdges]);

  // Auto-focus logic
  useEffect(() => {
    if (selectedNode) {
      const currentNodes = getNodes();
      const node = currentNodes.find((n) => n.id === selectedNode);
      if (node) {
        const isNested = !!node.parentNode;
        let targetX = node.position.x;
        let targetY = node.position.y;

        if (isNested) {
          const parent = currentNodes.find((n) => n.id === node.parentNode);
          if (parent) {
            targetX += parent.position.x;
            targetY += parent.position.y;
          }
        }

        // Center on the node itself (adding half width/height for true centering)
        // and offset slightly to the left to account for the side panel
        setCenter(targetX + 100, targetY + 50, { zoom: 1.2, duration: 800 });
        onShowDependencies(true);
      }
    }
  }, [selectedNode, setCenter, onShowDependencies, getNodes]);
}
