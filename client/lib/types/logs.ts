export interface ScanLog {
  id: string;
  repoName: string;
  status: 'Success' | 'Warning' | 'Error';
  timestamp: string;
  duration: string;
  nodesFound: number;
}

export interface AIHistory {
  id: string;
  repoName: string;
  timestamp: string;
  prompt: string;
  response: string;
}
