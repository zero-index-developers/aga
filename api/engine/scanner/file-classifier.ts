import { NodeType } from './types';

export interface ClassificationRule {
  pattern: string | RegExp;
  type: string;
}

// Default rules optimized for Next.js and the Aga repo structure
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
