export interface ScanOptions {
  exclusions?: string[];
}

export type NodeType = 'group' | 'custom';

export interface NodeStyle {
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface Node {
  id: string;
  data: {
    label: string;
    type: string;
    path: string;
    color?: string;
    origX?: number;
    origY?: number;
    origWidth?: number;
    origHeight?: number;
  };
  position: { x: number; y: number };
  parentNode?: string;
  type: NodeType;
  style?: NodeStyle;
  className?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface GroupConfig {
  id: string;
  label: string;
  path: string;
  className: string;
  color: string;
}

// Color schemes for different group types
const GROUP_COLORS = {
  component: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', color: 'bg-blue-600' },
  page: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', color: 'bg-purple-600' },
  hook: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', color: 'bg-emerald-600' },
  context: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', color: 'bg-amber-600' },
  lib: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', color: 'bg-indigo-600' },
  api: { bg: 'bg-green-500/5', border: 'border-green-500/20', color: 'bg-green-600' },
  service: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', color: 'bg-cyan-600' },
  model: { bg: 'bg-rose-500/5', border: 'border-rose-500/20', color: 'bg-rose-600' },
  controller: { bg: 'bg-orange-500/5', border: 'border-orange-500/20', color: 'bg-orange-600' },
  view: { bg: 'bg-pink-500/5', border: 'border-pink-500/20', color: 'bg-pink-600' },
  middleware: { bg: 'bg-violet-500/5', border: 'border-violet-500/20', color: 'bg-violet-600' },
  config: { bg: 'bg-slate-500/5', border: 'border-slate-500/20', color: 'bg-slate-600' },
  type: { bg: 'bg-teal-500/5', border: 'border-teal-500/20', color: 'bg-teal-600' },
  default: { bg: 'bg-gray-500/5', border: 'border-gray-500/20', color: 'bg-gray-600' },
};

/**
 * Generates group configurations based on detected project structure
 */
export function generateGroups(structure: any): GroupConfig[] {
  const groups: GroupConfig[] = [];
  let groupIndex = 0;

  const addGroups = (dirs: string[], type: string, label: string) => {
    dirs.forEach(dir => {
      const colors = GROUP_COLORS[type as keyof typeof GROUP_COLORS] || GROUP_COLORS.default;
      const displayLabel = label || `/${dir}`;
      
      groups.push({
        id: `group-${type}-${groupIndex++}`,
        label: displayLabel,
        path: dir + '/',
        className: `${colors.bg} ${colors.border} rounded-xl z-[-1]`,
        color: colors.color,
      });
    });
  };

  // Add groups for each detected directory type
  if (structure.componentDirs?.length) {
    addGroups(structure.componentDirs, 'component', 'Components');
  }
  if (structure.pageDirs?.length) {
    addGroups(structure.pageDirs, 'page', 'Pages');
  }
  if (structure.hookDirs?.length) {
    addGroups(structure.hookDirs, 'hook', 'Hooks');
  }
  if (structure.libDirs?.length) {
    addGroups(structure.libDirs, 'lib', 'Libraries');
  }
  if (structure.apiDirs?.length) {
    addGroups(structure.apiDirs, 'api', 'API');
  }
  if (structure.serviceDirs?.length) {
    addGroups(structure.serviceDirs, 'service', 'Services');
  }
  if (structure.modelDirs?.length) {
    addGroups(structure.modelDirs, 'model', 'Models');
  }
  if (structure.controllerDirs?.length) {
    addGroups(structure.controllerDirs, 'controller', 'Controllers');
  }

  return groups;
}

/**
 * Generates type configuration based on groups
 */
export function generateTypeConfig(groups: GroupConfig[]): Record<string, { color: string; parent: string }> {
  const config: Record<string, { color: string; parent: string }> = {};

  groups.forEach(group => {
    // Extract type from group id (e.g., 'group-component-0' -> 'component')
    const typeMatch = group.id.match(/^group-([^-]+)/);
    const type = typeMatch ? typeMatch[1] : 'unknown';
    
    // Map type to group (first group of that type)
    if (!config[type]) {
      config[type] = {
        color: group.color,
        parent: group.id,
      };
    }
  });

  // Add fallback
  config.unknown = { color: 'bg-gray-600', parent: groups[0]?.id || '' };

  return config;
}

// Default groups for backward compatibility (AGA structure)
export const GROUPS: GroupConfig[] = [
  { id: 'group-pages', label: '/client/app (Routes)', path: 'client/app/', className: 'bg-purple-500/5 border-purple-500/20 rounded-xl z-[-1]', color: 'bg-purple-600' },
  { id: 'group-components', label: '/client/components', path: 'client/components/', className: 'bg-blue-500/5 border-blue-500/20 rounded-xl z-[-1]', color: 'bg-blue-600' },
  { id: 'group-ui', label: '/client/components/ui', path: 'client/components/ui/', className: 'bg-slate-500/5 border-slate-500/20 rounded-xl z-[-1]', color: 'bg-slate-600' },
  { id: 'group-hooks', label: '/client/hooks', path: 'client/hooks/', className: 'bg-emerald-500/5 border-emerald-500/20 rounded-xl z-[-1]', color: 'bg-emerald-600' },
  { id: 'group-contexts', label: '/client/contexts', path: 'client/contexts/', className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1]', color: 'bg-amber-600' },
  { id: 'group-lib', label: '/client/lib', path: 'client/lib/', className: 'bg-indigo-500/5 border-indigo-500/20 rounded-xl z-[-1]', color: 'bg-indigo-600' },
  { id: 'group-engine', label: '/api/engine', path: 'api/engine/', className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1]', color: 'bg-amber-600' },
];

export const TYPE_CONFIG: Record<string, { color: string; parent: string }> = {
  component: { color: 'bg-blue-600', parent: 'group-components' },
  page: { color: 'bg-purple-600', parent: 'group-pages' },
  api: { color: 'bg-emerald-600', parent: 'group-pages' },
  hook: { color: 'bg-emerald-600', parent: 'group-hooks' },
  ui: { color: 'bg-slate-600', parent: 'group-ui' },
  context: { color: 'bg-amber-600', parent: 'group-contexts' },
  lib: { color: 'bg-indigo-600', parent: 'group-lib' },
  engine: { color: 'bg-amber-600', parent: 'group-engine' },
  service: { color: 'bg-cyan-600', parent: '' },
  model: { color: 'bg-rose-600', parent: '' },
  controller: { color: 'bg-orange-600', parent: '' },
  view: { color: 'bg-pink-600', parent: '' },
  middleware: { color: 'bg-violet-600', parent: '' },
  config: { color: 'bg-slate-600', parent: '' },
  type: { color: 'bg-teal-600', parent: '' },
  // Fallback
  unknown: { color: 'bg-gray-600', parent: 'group-engine' },
};
