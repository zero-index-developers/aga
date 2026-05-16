import { useState, useEffect, useRef } from 'react';
import { Node, useReactFlow } from 'reactflow';

export function useFlowView(
  setNodes: (updater: (nds: Node[]) => Node[]) => void,
  initialNodes: Node[]
) {
  const [showFolders, setShowFolders] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const prevExplodedRef = useRef(false);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
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
              width: isExploded ? baseWidth * 2.2 : baseWidth,
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
            x: isExploded ? (origX - 20) * 2.2 + 20 : origX,
            y: origY,
          },
          data: {
            ...n.data,
            showPath: showPaths,
          }
        };
      })
    );

    if (prevExplodedRef.current !== isExploded) {
      setTimeout(() => fitView({ duration: 800 }), 100);
      prevExplodedRef.current = isExploded;
    }
  }, [showFolders, showPaths, isExploded, setNodes, fitView]);

  return {
    showFolders,
    setShowFolders,
    showPaths,
    setShowPaths,
    isExploded,
    setIsExploded
  };
}
