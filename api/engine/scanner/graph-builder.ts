import fs from 'fs/promises';
import path from 'path';
import { Node, Edge, TYPE_CONFIG, GROUPS, GroupConfig, generateGroups, generateTypeConfig } from './types';
import { classifyFile, ClassificationRule } from './file-classifier';
import { extractImports, resolveImportPath } from './import-resolver';

export async function buildGraph(
  filePaths: string[],
  rootPath: string,
  classificationRules?: ClassificationRule[],
  customGroups?: GroupConfig[]
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const fileMap = new Map<string, string>(); // relPath -> nodeId
  
  // Use custom groups if provided, otherwise use default GROUPS
  const groups = customGroups || GROUPS;
  const typeConfig = customGroups ? generateTypeConfig(customGroups) : TYPE_CONFIG;
  
  // 1. Add Group Nodes
  groups.forEach(group => {
    nodes.push({
      id: group.id,
      data: {
        label: group.label,
        type: 'folder',
        path: group.path,
        color: group.color
      },
      position: { x: 0, y: 0 },
      type: 'group',
      className: group.className,
      style: {}
    });
  });

  // 2. Build Custom Nodes
  for (const relPath of filePaths) {
    const type = classificationRules
      ? classifyFile(relPath, classificationRules)
      : classifyFile(relPath);
    
    // Create node ID by removing file extension and replacing slashes
    const id = relPath.replace(/\//g, '-').replace(/\.\w+$/, '');
    const config = typeConfig[type] || typeConfig['unknown'] || { color: 'bg-gray-600', parent: '' };
    
    // Get file name without extension
    const fileName = path.basename(relPath).replace(/\.\w+$/, '');

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
    fileMap.set(relPath.replace(/\.\w+$/, ''), id);
  }

  // 3. Build Edges
  const addedEdges = new Set<string>();

  for (const node of nodes) {
    if (node.type !== 'custom') continue;

    try {
      const fullPath = path.join(rootPath, node.data.path);
      const content = await fs.readFile(fullPath, 'utf8');
      const fileExt = path.extname(node.data.path);
      
      const rawImports = extractImports(content, fileExt);
      
      for (const rawImport of rawImports) {
        const resolvedPath = resolveImportPath(rawImport, node.data.path);
        if (!resolvedPath) continue; // External or unresolvable import

        // Check possible local file variations with multiple extensions
        const possiblePaths = [
          resolvedPath,
          `${resolvedPath}.tsx`,
          `${resolvedPath}.ts`,
          `${resolvedPath}.jsx`,
          `${resolvedPath}.js`,
          `${resolvedPath}.vue`,
          `${resolvedPath}.svelte`,
          `${resolvedPath}.py`,
          `${resolvedPath}.java`,
          `${resolvedPath}.go`,
          `${resolvedPath}.php`,
          `${resolvedPath}.rb`,
          `${resolvedPath}/index.tsx`,
          `${resolvedPath}/index.ts`,
          `${resolvedPath}/index.jsx`,
          `${resolvedPath}/index.js`,
          `${resolvedPath}/index.vue`,
          `${resolvedPath}/__init__.py`,
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

  // 4. Clean up groups with <= 1 child
  const groupChildrenCount = new Map<string, number>();
  nodes.forEach(n => {
    if (n.parentNode) {
      groupChildrenCount.set(n.parentNode, (groupChildrenCount.get(n.parentNode) || 0) + 1);
    }
  });

  const validGroups = new Set(
    Array.from(groupChildrenCount.entries())
      .filter(([, count]) => count > 1)
      .map(([groupId]) => groupId)
  );

  const finalNodes = nodes.filter(n => {
    if (n.type === 'group' && !validGroups.has(n.id)) {
      return false; // Remove empty or 1-child groups
    }
    return true;
  }).map(n => {
    if (n.parentNode && !validGroups.has(n.parentNode)) {
      return { ...n, parentNode: undefined }; // Ungroup lonely children
    }
    return n;
  });

  return { nodes: finalNodes, edges };
}
