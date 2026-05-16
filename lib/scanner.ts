import fs from 'fs';
import path from 'path';
import { Node, Edge, TYPE_CONFIG } from './scanner/types';
import { applyGridLayout } from './scanner/layout-engine';

export async function scanProject(rootPath: string) {
  const nodes: Node[] = [
    // Folder Groups
    { id: 'group-pages', data: { label: '/app (Pages)', type: 'folder', path: 'app/', color: '' }, position: { x: 50, y: 50 }, style: { width: 840, height: 200 }, className: 'bg-purple-500/5 border-purple-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-api', data: { label: '/api (Routes)', type: 'folder', path: 'app/api/', color: '' }, position: { x: 50, y: 190 }, style: { width: 840, height: 120 }, className: 'bg-emerald-500/5 border-emerald-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-components', data: { label: '/components', type: 'folder', path: 'components/', color: '' }, position: { x: 50, y: 330 }, style: { width: 840, height: 120 }, className: 'bg-blue-500/5 border-blue-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-ui', data: { label: '/components/ui', type: 'folder', path: 'components/ui/', color: '' }, position: { x: 50, y: 470 }, style: { width: 840, height: 120 }, className: 'bg-slate-500/5 border-slate-500/20 rounded-xl z-[-1]', type: 'group' },
    { id: 'group-lib', data: { label: '/lib', type: 'folder', path: 'lib/', color: '' }, position: { x: 50, y: 610 }, style: { width: 840, height: 120 }, className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1]', type: 'group' },
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
        let type = 'lib';
        if (relPath.includes('app/api')) type = 'api';
        else if (relPath.includes('app/')) type = 'page';
        else if (relPath.includes('components/ui')) {
          return; // Skip individual UI components for consolidation
        }
        else if (relPath.includes('components/')) type = 'component';

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
      path: 'components/ui/',
      color: TYPE_CONFIG.ui.color,
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
      
      for (const match of importMatches) {
        const importPath = match[1];
        let targetId: string | undefined;

        if (importPath.includes('components/ui/')) {
          targetId = uiId;
        } else if (importPath.startsWith('@/')) {
          const resolvedRelPath = importPath.replace('@/', '') + '.tsx';
          const possiblePaths = [
            resolvedRelPath,
            resolvedRelPath.replace('.tsx', '.ts'),
            resolvedRelPath.replace('.tsx', '/index.tsx'),
            resolvedRelPath.replace('.tsx', '/index.ts'),
          ];

          for (const p of possiblePaths) {
            const foundId = fileMap.get(p);
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
