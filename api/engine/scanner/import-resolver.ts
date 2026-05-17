import path from 'path';
import fs from 'fs/promises';

export interface AliasMap {
  [alias: string]: string;
}

// Default aliases based on Next.js/React standard structures
export const DEFAULT_ALIASES: AliasMap = {
  '@client/': 'client/',
  '@/': 'client/',
  '@api/': 'api/'
};

/**
 * Strips single and multi-line comments from file content to prevent parsing commented imports.
 */
function stripComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

/**
 * Parses all module dependencies (import, export from, dynamic import, require) from file content.
 */
export function extractImports(content: string): string[] {
  const cleanContent = stripComments(content);
  const imports = new Set<string>();
  
  // Matches:
  // 1. import/export ... from 'module' or import 'module'
  // 2. import('module')
  // 3. require('module')
  const importRegex = /(?:import|export)\s+(?:[^;]*?from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|require\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = importRegex.exec(cleanContent)) !== null) {
    // The module path will be in one of the capture groups depending on the syntax used
    const modulePath = match[1] || match[2] || match[3];
    if (modulePath) {
      imports.add(modulePath);
    }
  }

  return Array.from(imports);
}

/**
 * Resolves an import string to a standardized relative path within the repository.
 */
export function resolveImportPath(
  importPath: string, 
  currentFilePath: string, 
  aliases: AliasMap = DEFAULT_ALIASES
): string | null {
  const currentDir = path.dirname(currentFilePath);
  
  // 1. Handle aliases
  for (const [alias, replacement] of Object.entries(aliases)) {
    if (importPath.startsWith(alias)) {
      return importPath.replace(alias, replacement);
    }
  }

  // 2. Handle relative imports
  if (importPath.startsWith('.')) {
    return path.join(currentDir, importPath).replace(/\\/g, '/');
  }

  // 3. External dependencies (e.g. 'react', 'lodash') - return null so they are ignored in the internal graph
  return null;
}
