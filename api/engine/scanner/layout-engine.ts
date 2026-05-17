import { Node } from './types';

export function applyGridLayout(nodes: Node[]) {
  const MAX_COLS = 4;
  const COL_WIDTH = 220;
  const ROW_HEIGHT = 100;
  const counts: Record<string, number> = {};
  
  // Layout components in a wrapped grid
  nodes.forEach(node => {
    if (node.parentNode) {
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

  // Scale folder containers to fit the grid and stack them vertically
  let currentY = 50;
  
  nodes.forEach(node => {
    if (node.type === 'group') {
      const count = counts[node.id] || 0;
      const actualCols = Math.min(Math.max(count, 1), MAX_COLS);
      const rows = Math.max(Math.ceil(count / MAX_COLS), 1);
      
      const width = (actualCols * COL_WIDTH) + 40;
      const height = (rows * ROW_HEIGHT) + 60;

      if (node.style) {
        node.style.width = width;
        node.style.height = height;
      }
      
      // Persist original dimensions for transformations
      if (node.data) {
        node.data.origWidth = width;
        node.data.origHeight = height;
        // Also persist the dynamic Y position
        node.data.origY = currentY;
      }
      
      // Update position dynamically based on previous heights
      node.position = {
        x: 50,
        y: currentY
      };
      
      // Add gap for the next group
      currentY += height + 50;
    }
  });

  // Finally, layout any ungrouped nodes below all the groups
  let ungroupedIndex = 0;
  nodes.forEach(node => {
    if (node.type === 'custom' && !node.parentNode) {
      const col = ungroupedIndex % MAX_COLS;
      const row = Math.floor(ungroupedIndex / MAX_COLS);
      
      const newX = 50 + (col * COL_WIDTH);
      const newY = currentY + (row * ROW_HEIGHT);
      
      node.position = { x: newX, y: newY };
      
      if (node.data) {
        node.data.origX = newX;
        node.data.origY = newY;
      }
      
      ungroupedIndex++;
    }
  });
}
