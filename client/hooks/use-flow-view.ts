import { useState, useEffect, useRef } from 'react';
import { Node, useReactFlow } from 'reactflow';

export function useFlowView(
  setNodes: (updater: (nds: Node[]) => Node[]) => void,
  initialNodes: Node[]
) {
  const [showFolders, setShowFolders] = useState(false);
  const [showPaths, setShowPaths] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const prevExplodedRef = useRef(false);
  const { fitView } = useReactFlow();

  // Track the last processed state to prevent infinite loops when adding initialNodes to dependencies
  const lastStateRef = useRef({
    nodes: null as Node[] | null,
    showFolders,
    showPaths,
    isExploded,
  });

  useEffect(() => {
    // If the nodes and all toggles are exactly the same as what we last processed, do nothing.
    if (
      initialNodes === lastStateRef.current.nodes &&
      showFolders === lastStateRef.current.showFolders &&
      showPaths === lastStateRef.current.showPaths &&
      isExploded === lastStateRef.current.isExploded
    ) {
      return;
    }

    setNodes((nds) => {
      const nextNodes = nds.map((n) => {
        const origX = n.data.origX ?? n.position.x;
        const origY = n.data.origY ?? n.position.y;

        // Handle folder nodes
        if (n.id.startsWith('group-')) {
          const baseWidth = n.data.origWidth ?? (n.style?.width as number) ?? 840;
          const baseHeight = n.data.origHeight ?? (n.style?.height as number) ?? 120;
          return {
            ...n,
            style: {
              ...n.style,
              opacity: showFolders ? 1 : 0,
              width: isExploded ? baseWidth * 1.35 : baseWidth,
              height: isExploded ? baseHeight * 1.5 : baseHeight,
            },
            position: {
              x: origX,
              y: isExploded ? origY * 1.5 : origY
            },
            className: showFolders ? n.className : 'opacity-0 pointer-events-none',
            selectable: showFolders,
            draggable: showFolders,
          };
        }

        // Handle component nodes
        return {
          ...n,
          position: {
            x: isExploded ? (origX - 20) * 1.5 + 20 : origX,
            y: isExploded ? (origY - 40) * 1.5 + 40 : origY,
          },
          data: {
            ...n.data,
            showPath: showPaths,
          }
        };
      });

      // Update the reference of last processed state
      lastStateRef.current = {
        nodes: nextNodes,
        showFolders,
        showPaths,
        isExploded,
      };

      return nextNodes;
    });

    if (prevExplodedRef.current !== isExploded) {
      setTimeout(() => fitView({ duration: 800 }), 100);
      prevExplodedRef.current = isExploded;
    }
  }, [initialNodes, showFolders, showPaths, isExploded, setNodes, fitView]);

  return {
    showFolders,
    setShowFolders,
    showPaths,
    setShowPaths,
    isExploded,
    setIsExploded
  };
}
