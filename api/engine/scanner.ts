import fs from 'fs';
import path from 'path';
import { Node, Edge, TYPE_CONFIG } from './scanner/types';
import { applyGridLayout } from './scanner/layout-engine';

export async function scanProject(rootPath: string) {
  const nodes: Node[] = [
    // Folder Groups
    { id: 'group-pages', data: { label: '/client/app (Routes)', type: 'folder', path: 'client/app/' }, position: { x: 50, y: 50 }, style: {}, className: 'bg-purple-500/5 border-purple-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-components', data: { label: '/client/components', type: 'folder', path: 'client/components/' }, position: { x: 50, y: 250 }, style: {}, className: 'bg-blue-500/5 border-blue-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-ui', data: { label: '/client/components/ui', type: 'folder', path: 'client/components/ui/' }, position: { x: 50, y: 450 }, style: {}, className: 'bg-slate-500/5 border-slate-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-engine', data: { label: '/api/engine', type: 'folder', path: 'api/engine/' }, position: { x: 50, y: 650 }, style: {}, className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-hooks', data: { label: '/client/hooks', type: 'folder', path: 'client/hooks/' }, position: { x: 50, y: 850 }, style: {}, className: 'bg-emerald-500/5 border-emerald-500/20 rounded-xl z-[-1]', type: 'group' },
  ];
  const edges: Edge[] = [];
  const fileMap = new Map<string, string>();

  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
      
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          walk(fullPath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        let type = 'engine';
        if (relPath.includes('client/app/api')) type = 'api';
        else if (relPath.includes('client/app/')) type = 'page';
        else if (relPath.includes('client/components/ui')) {
          return; // Skip individual UI components for consolidation
        }
        else if (relPath.includes('client/components/')) type = 'component';
        else if (relPath.includes('client/hooks/')) type = 'hook';
        else if (relPath.includes('api/engine/')) type = 'engine';

        const id = relPath.replace(/\//g, '-').replace(/\.tsx?$/, '');
        const config = TYPE_CONFIG[type];

        nodes.push({
          id,
          parentNode: config.parent,
          data: {
            label: file.replace(/\.tsx?$/, ''),
            type,
            path: relPath,
            color: config.color,
          },
          position: { x: 0, y: 0 },
          type: 'custom',
        });
        fileMap.set(relPath, id);
      }
    }
  }

  walk(rootPath);

  // Add the Collapsed UI Node
  const uiId = 'ui-shared';
  nodes.push({
    id: uiId,
    parentNode: 'group-ui',
    data: {
      label: 'Shared UI Library',
      type: 'ui',
      path: 'client/components/ui/',
    },
    position: { x: 20, y: 40 },
    type: 'custom',
  });

  // Apply Grid Layout
  applyGridLayout(nodes, uiId);

  // Extract Edges from Imports
  const addedEdges = new Set<string>();
  nodes.forEach(node => {
    if (node.type === 'custom' && node.id !== uiId) {
      const content = fs.readFileSync(path.join(rootPath, node.data.path), 'utf8');
      const importMatches = content.matchAll(/from ['"](.+?)['"]/g);
      
      const currentDir = path.dirname(node.data.path);

      for (const match of importMatches) {
        const importPath = match[1];
        let targetId: string | undefined;

        // Resolve Path
        let resolvedRelPath = '';
        if (importPath.startsWith('@/')) {
          resolvedRelPath = importPath.replace('@/', '');
        } else if (importPath.startsWith('.')) {
          resolvedRelPath = path.join(currentDir, importPath).replace(/\\/g, '/');
        } else {
          // Check for explicit folder paths that match our groups
          if (importPath.includes('components/ui/')) targetId = uiId;
          else continue; // Skip external packages
        }

        if (!targetId && resolvedRelPath) {
          const possiblePaths = [
            resolvedRelPath,
            resolvedRelPath + '.tsx',
            resolvedRelPath + '.ts',
            path.join(resolvedRelPath, 'index.tsx').replace(/\\/g, '/'),
            path.join(resolvedRelPath, 'index.ts').replace(/\\/g, '/'),
          ];

          for (const p of possiblePaths) {
            const foundId = fileMap.get(p) || fileMap.get(p.replace(/\.tsx?$/, ''));
            if (foundId) {
              targetId = foundId;
              break;
            }
          }
        }

        if (targetId && targetId !== node.id) {
          const edgeId = `${node.id}-to-${targetId}`;
          if (!addedEdges.has(edgeId)) {
            edges.push({ id: edgeId, source: node.id, target: targetId });
            addedEdges.add(edgeId);
          }
        }
      }
    }
  });

  return { nodes, edges };
}
