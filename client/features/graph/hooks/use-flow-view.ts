import { useState, useEffect, useRef } from 'react';
import { Node, useReactFlow } from 'reactflow';

export function useFlowView(
  setNodes: (updater: (nds: Node[]) => Node[]) => void,
  initialNodes: Node[]
) {
  const [showFolders, setShowFolders] = useState(false);
  const [showPaths, setShowPaths] = useState(true);
  const { fitView } = useReactFlow();

  // Track the last processed state to prevent infinite loops when adding initialNodes to dependencies
  const lastStateRef = useRef({
    initialNodes: null as Node[] | null,
    showFolders,
    showPaths,
  });

  useEffect(() => {
    // If the nodes and all toggles are exactly the same as what we last processed, do nothing.
    if (
      initialNodes === lastStateRef.current.initialNodes &&
      showFolders === lastStateRef.current.showFolders &&
      showPaths === lastStateRef.current.showPaths
    ) {
      return;
    }

    const isInitialNodesChanged = initialNodes !== lastStateRef.current.initialNodes;
    const shouldUpdatePosition = isInitialNodesChanged;

    setNodes((nds) => {
      const nextNodes = nds.map((n) => {
        const origX = n.data.origX ?? n.position.x;
        const origY = n.data.origY ?? n.position.y;

        // Handle folder nodes
        if (n.id.startsWith('group-')) {
          const isCollapsed = n.data?.isCollapsed;
          const baseWidth = n.data.origWidth ?? (n.style?.width as number) ?? 840;
          const baseHeight = n.data.origHeight ?? (n.style?.height as number) ?? 120;
          
          if (isCollapsed) {
            return {
              ...n,
              style: {
                ...n.style,
                opacity: 1,
                width: 'auto',
                height: 'auto',
                backgroundColor: 'transparent',
                border: 'none',
              },
              className: '',
              selectable: true,
              draggable: true,
            };
          }

          return {
            ...n,
            data: {
              ...n.data,
              isFolderViewActive: showFolders
            },
            style: {
              ...n.style,
              opacity: showFolders ? 1 : 0,
              width: baseWidth,
              height: baseHeight,
              backgroundColor: undefined,
              border: undefined,
            },
            position: shouldUpdatePosition ? {
              x: origX,
              y: origY
            } : n.position,
            className: showFolders ? (n.data?.origClassName || n.className) : 'opacity-0 pointer-events-none',
            selectable: showFolders,
            draggable: showFolders,
          };
        }

        // Handle component nodes
        return {
          ...n,
          position: shouldUpdatePosition ? {
            x: origX,
            y: origY,
          } : n.position,
          data: {
            ...n.data,
            showPath: showPaths,
          }
        };
      });

      // Update the reference of last processed state
      lastStateRef.current = {
        initialNodes,
        showFolders,
        showPaths,
      };

      return nextNodes;
    });
  }, [initialNodes, showFolders, showPaths, setNodes, fitView]);

  return {
    showFolders,
    setShowFolders,
    showPaths,
    setShowPaths,
  };
}
