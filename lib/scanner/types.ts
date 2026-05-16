export interface Node {
  id: string;
  data: {
    label: string;
    type: string;
    path: string;
    color: string;
  };
  position: { x: number; y: number };
  parentNode?: string;
  type: string;
  style?: any;
  className?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export const TYPE_CONFIG: Record<string, { color: string; parent: string }> = {
  component: { color: 'bg-blue-600', parent: 'group-components' },
  page: { color: 'bg-purple-600', parent: 'group-pages' },
  api: { color: 'bg-emerald-600', parent: 'group-api' },
  lib: { color: 'bg-amber-600', parent: 'group-lib' },
  ui: { color: 'bg-slate-600', parent: 'group-ui' },
};
