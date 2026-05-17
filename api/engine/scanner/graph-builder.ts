import fs from 'fs/promises';
import path from 'path';
import { Node, Edge, TYPE_CONFIG, GROUPS } from './types';
import { classifyFile } from './file-classifier';
import { extractImports, resolveImportPath } from './import-resolver';

export async function buildGraph(filePaths: string[], rootPath: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const fileMap = new Map<string, string>(); // relPath -> nodeId
  
  // 1. Add Group Nodes
  GROUPS.forEach(group => {
    nodes.push({
      id: group.id,
      data: { 
        label: group.label, 
        type: 'folder', 
        path: group.path 
      },
      position: { x: 0, y: 0 },
      type: 'group',
      className: group.className,
      style: {}
    });
  });

  // 2. Build Custom Nodes
  for (const relPath of filePaths) {
    const type = classifyFile(relPath);
    const id = relPath.replace(/\//g, '-').replace(/\.tsx?$/, '');
    const config = TYPE_CONFIG[type] || TYPE_CONFIG['unknown'];
    const fileName = path.basename(relPath).replace(/\.tsx?$/, '');

    nodes.push({
      id,
      parentNode: config.parent,
      data: {
        label: fileName,
        type,
        path: relPath,
        color: config.color,
      },
      position: { x: 0, y: 0 },
      type: 'custom',
    });
    
    fileMap.set(relPath, id);
    // Also set extension-less mapping for easier resolving later
    fileMap.set(relPath.replace(/\.tsx?$/, ''), id);
  }

  // 3. Build Edges
  const addedEdges = new Set<string>();

  for (const node of nodes) {
    if (node.type !== 'custom') continue;

    try {
      const fullPath = path.join(rootPath, node.data.path);
      const content = await fs.readFile(fullPath, 'utf8');
      
      const rawImports = extractImports(content);
      
      for (const rawImport of rawImports) {
        const resolvedPath = resolveImportPath(rawImport, node.data.path);
        if (!resolvedPath) continue; // External or unresolvable import

        // Check possible local file variations
        const possiblePaths = [
          resolvedPath,
          `${resolvedPath}.tsx`,
          `${resolvedPath}.ts`,
          `${resolvedPath}/index.tsx`,
          `${resolvedPath}/index.ts`,
        ];

        let targetId: string | undefined;
        for (const p of possiblePaths) {
          if (fileMap.has(p)) {
            targetId = fileMap.get(p);
            break;
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
    } catch (error) {
      console.warn(`Failed to parse imports for node ${node.id} at ${node.data.path}`, error);
    }
  }

  return { nodes, edges };
}
