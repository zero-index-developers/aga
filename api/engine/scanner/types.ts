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
}

export const GROUPS: GroupConfig[] = [
  { id: 'group-pages', label: '/client/app (Routes)', path: 'client/app/', className: 'bg-purple-500/5 border-purple-500/20 rounded-xl z-[-1]' },
  { id: 'group-components', label: '/client/components', path: 'client/components/', className: 'bg-blue-500/5 border-blue-500/20 rounded-xl z-[-1]' },
  { id: 'group-ui', label: '/client/components/ui', path: 'client/components/ui/', className: 'bg-slate-500/5 border-slate-500/20 rounded-xl z-[-1]' },
  { id: 'group-hooks', label: '/client/hooks', path: 'client/hooks/', className: 'bg-emerald-500/5 border-emerald-500/20 rounded-xl z-[-1]' },
  { id: 'group-contexts', label: '/client/contexts', path: 'client/contexts/', className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1]' },
  { id: 'group-lib', label: '/client/lib', path: 'client/lib/', className: 'bg-indigo-500/5 border-indigo-500/20 rounded-xl z-[-1]' },
  { id: 'group-engine', label: '/api/engine', path: 'api/engine/', className: 'bg-amber-500/5 border-amber-500/20 rounded-xl z-[-1]' },
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
  // Fallback
  unknown: { color: 'bg-gray-600', parent: 'group-engine' },
};
