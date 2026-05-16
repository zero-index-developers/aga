import { Node } from './types';

export function applyGridLayout(nodes: Node[], uiId: string) {
  const MAX_COLS = 5;
  const COL_WIDTH = 160;
  const ROW_HEIGHT = 70;
  const counts: Record<string, number> = { 'group-ui': 1 };
  
  // Layout components in a wrapped grid
  nodes.forEach(node => {
    if (node.parentNode && node.id !== uiId) {
      const index = counts[node.parentNode] || 0;
      const col = index % MAX_COLS;
      const row = Math.floor(index / MAX_COLS);
      
      node.position = { 
        x: 20 + (col * COL_WIDTH), 
        y: 40 + (row * ROW_HEIGHT) 
      };
      counts[node.parentNode] = index + 1;
    }
  });

  // Scale folder containers to fit the grid
  nodes.forEach(node => {
    if (node.type === 'group' && counts[node.id]) {
      const rows = Math.ceil(counts[node.id] / MAX_COLS);
      if (node.style) {
        node.style.width = (MAX_COLS * COL_WIDTH) + 40;
        node.style.height = (rows * ROW_HEIGHT) + 60;
      }
    }
  });
}
