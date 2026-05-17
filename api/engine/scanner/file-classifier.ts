import { NodeType } from './types';

export interface ClassificationRule {
  pattern: string | RegExp;
  type: string;
}

export interface ProjectStructure {
  rootDirs: string[];
  componentDirs: string[];
  pageDirs: string[];
  hookDirs: string[];
  libDirs: string[];
  apiDirs: string[];
  utilDirs: string[];
  serviceDirs: string[];
  modelDirs: string[];
  controllerDirs: string[];
}

/**
 * Analyzes file paths to detect the project's directory structure
 */
export function detectProjectStructure(filePaths: string[]): ProjectStructure {
  const structure: ProjectStructure = {
    rootDirs: [],
    componentDirs: [],
    pageDirs: [],
    hookDirs: [],
    libDirs: [],
    apiDirs: [],
    utilDirs: [],
    serviceDirs: [],
    modelDirs: [],
    controllerDirs: [],
  };

  const dirCounts = new Map<string, number>();
  
  // Count occurrences of each directory
  filePaths.forEach(filePath => {
    const parts = filePath.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts.slice(0, i + 1).join('/');
      dirCounts.set(dir, (dirCounts.get(dir) || 0) + 1);
    }
  });

  // Identify directories by common naming patterns
  dirCounts.forEach((count, dir) => {
    const dirName = dir.split('/').pop()?.toLowerCase() || '';
    const fullPath = dir.toLowerCase();
    
    // Only consider directories with at least 2 files
    if (count < 2) return;

    // Component directories
    if (dirName.includes('component') || fullPath.includes('/components/')) {
      structure.componentDirs.push(dir);
    }
    // Page/Route directories
    else if (dirName.includes('page') || dirName.includes('route') ||
             fullPath.includes('/pages/') || fullPath.includes('/routes/') ||
             fullPath.includes('/app/') && !fullPath.includes('/app/api')) {
      structure.pageDirs.push(dir);
    }
    // Hook directories
    else if (dirName.includes('hook') || fullPath.includes('/hooks/')) {
      structure.hookDirs.push(dir);
    }
    // Library/Utility directories
    else if (dirName.includes('lib') || dirName.includes('util') ||
             fullPath.includes('/lib/') || fullPath.includes('/utils/')) {
      structure.libDirs.push(dir);
    }
    // API directories
    else if (dirName.includes('api') || fullPath.includes('/api/')) {
      structure.apiDirs.push(dir);
    }
    // Service directories
    else if (dirName.includes('service') || fullPath.includes('/services/')) {
      structure.serviceDirs.push(dir);
    }
    // Model directories
    else if (dirName.includes('model') || fullPath.includes('/models/')) {
      structure.modelDirs.push(dir);
    }
    // Controller directories
    else if (dirName.includes('controller') || fullPath.includes('/controllers/')) {
      structure.controllerDirs.push(dir);
    }
  });

  // Identify root directories (src, app, client, server, etc.)
  const commonRoots = ['src', 'app', 'client', 'server', 'packages', 'libs'];
  dirCounts.forEach((count, dir) => {
    const firstPart = dir.split('/')[0];
    if (commonRoots.includes(firstPart) && !structure.rootDirs.includes(firstPart)) {
      structure.rootDirs.push(firstPart);
    }
  });

  return structure;
}

/**
 * Generates classification rules based on detected project structure
 */
export function generateClassificationRules(structure: ProjectStructure): ClassificationRule[] {
  const rules: ClassificationRule[] = [];

  // Add rules for detected directories (most specific first)
  structure.componentDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'component' });
  });

  structure.pageDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'page' });
  });

  structure.hookDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'hook' });
  });

  structure.apiDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'api' });
  });

  structure.libDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'lib' });
  });

  structure.serviceDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'service' });
  });

  structure.modelDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'model' });
  });

  structure.controllerDirs.forEach(dir => {
    rules.push({ pattern: dir, type: 'controller' });
  });

  // Add generic fallback patterns (case-insensitive)
  rules.push(
    { pattern: /\/components?\//i, type: 'component' },
    { pattern: /\/pages?\//i, type: 'page' },
    { pattern: /\/routes?\//i, type: 'page' },
    { pattern: /\/hooks?\//i, type: 'hook' },
    { pattern: /\/contexts?\//i, type: 'context' },
    { pattern: /\/lib\//i, type: 'lib' },
    { pattern: /\/utils?\//i, type: 'lib' },
    { pattern: /\/helpers?\//i, type: 'lib' },
    { pattern: /\/api\//i, type: 'api' },
    { pattern: /\/services?\//i, type: 'service' },
    { pattern: /\/models?\//i, type: 'model' },
    { pattern: /\/controllers?\//i, type: 'controller' },
    { pattern: /\/views?\//i, type: 'view' },
    { pattern: /\/middleware\//i, type: 'middleware' },
    { pattern: /\/config\//i, type: 'config' },
    { pattern: /\/types?\//i, type: 'type' },
    { pattern: /\/interfaces?\//i, type: 'type' },
  );

  return rules;
}

// Default rules for backward compatibility
export const DEFAULT_CLASSIFICATION_RULES: ClassificationRule[] = [
  { pattern: 'client/app/api', type: 'api' },
  { pattern: 'client/app/', type: 'page' },
  { pattern: 'client/components/ui/', type: 'ui' },
  { pattern: 'client/components/', type: 'component' },
  { pattern: 'client/hooks/', type: 'hook' },
  { pattern: 'client/contexts/', type: 'context' },
  { pattern: 'client/lib/', type: 'lib' },
  { pattern: 'api/engine/', type: 'engine' },
];

export function classifyFile(relPath: string, rules: ClassificationRule[] = DEFAULT_CLASSIFICATION_RULES): string {
  // Normalize path for matching
  const normalizedPath = relPath.replace(/\\/g, '/');

  for (const rule of rules) {
    if (typeof rule.pattern === 'string') {
      if (normalizedPath.includes(rule.pattern)) {
        return rule.type;
      }
    } else if (rule.pattern instanceof RegExp) {
      if (rule.pattern.test(normalizedPath)) {
        return rule.type;
      }
    }
  }

  // Fallback
  return 'unknown';
}
