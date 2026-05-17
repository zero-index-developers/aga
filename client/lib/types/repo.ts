export interface Settings {
  scanner: {
    exclusions: string[];
  };
  ai: {
    insightDepth: 'concise' | 'detailed';
    focus: 'architecture' | 'security' | 'performance';
  };
}

export interface RepoAnalytics {
  nodes: number;
  edges: number;
  health: number;
  lastScanned: string;
}

export interface Repository {
  name: string;
  url: string;
  analytics: RepoAnalytics;
}
