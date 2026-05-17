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
      
      // Build parent lookup and identify collapsed groups from current nodes list
      const parentMap = new Map<string, string>();
      const collapsedGroups = new Set<string>();
      
      nds.forEach(n => {
        if (n.parentNode) parentMap.set(n.id, n.parentNode);
        if (n.type === 'group' && n.data?.isCollapsed) collapsedGroups.add(n.id);
      });

      const selectedNodeObj = nds.find(n => n.id === selectedNode);
      const isSelectedGroup = selectedNodeObj?.type === 'group';

      // Map any child node to its visible parent group if that group is collapsed or if the group itself is selected
      const getVisualNodeId = (id: string) => {
        const parentId = parentMap.get(id);
        if (parentId) {
          if (parentId === selectedNode && isSelectedGroup) return selectedNode;
          if (collapsedGroups.has(parentId)) return parentId;
        }
        return id;
      };

      // Project original edges onto visual nodes
      const visualEdges = currentEdges.map(e => ({
        ...e,
        source: getVisualNodeId(e.source),
        target: getVisualNodeId(e.target),
      })).filter(e => e.source !== e.target);

      const relatedNodeIds = new Set<string>([selectedNode]);

      // Calculate related nodes using visual edges
      const findUpstream = (nodeId: string) => {
        visualEdges.forEach((edge) => {
          if (edge.target === nodeId && !relatedNodeIds.has(edge.source)) {
            relatedNodeIds.add(edge.source);
            findUpstream(edge.source);
          }
        });
      };

      const findDownstream = (nodeId: string) => {
        visualEdges.forEach((edge) => {
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
      // Find parent lookup and collapsed groups again to animate visual edges correctly
      const currentNodes = getNodes();
      const parentMap = new Map<string, string>();
      const collapsedGroups = new Set<string>();

      currentNodes.forEach(n => {
        if (n.parentNode) parentMap.set(n.id, n.parentNode);
        if (n.type === 'group' && n.data?.isCollapsed) collapsedGroups.add(n.id);
      });

      const selectedNodeObj = currentNodes.find(n => n.id === selectedNode);
      const isSelectedGroup = selectedNodeObj?.type === 'group';

      const getVisualNodeId = (id: string) => {
        const parentId = parentMap.get(id);
        if (parentId) {
          if (parentId === selectedNode && isSelectedGroup) return selectedNode;
          if (collapsedGroups.has(parentId)) return parentId;
        }
        return id;
      };

      return eds.map((e) => {
        const visualSource = getVisualNodeId(e.source);
        const visualTarget = getVisualNodeId(e.target);
        const isAnimated = visualSource === selectedNode || visualTarget === selectedNode;

        return {
          ...e,
          animated: isAnimated,
        };
      });
    });
  }, [selectedNode, setNodes, setEdges, getEdges]);

  // Show dependencies panel when a node is selected
  useEffect(() => {
    if (selectedNode) {
      onShowDependencies(true);
    }
  }, [selectedNode, onShowDependencies]);
}
