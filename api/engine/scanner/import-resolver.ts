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
 * Supports JavaScript, TypeScript, Python, Java, Go, PHP, and more.
 */
export function extractImports(content: string, fileExtension?: string): string[] {
  const cleanContent = stripComments(content);
  const imports = new Set<string>();
  
  // JavaScript/TypeScript imports
  // Matches:
  // 1. import/export ... from 'module' or import 'module'
  // 2. import('module')
  // 3. require('module')
  const jsImportRegex = /(?:import|export)\s+(?:[^;]*?from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|require\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = jsImportRegex.exec(cleanContent)) !== null) {
    const modulePath = match[1] || match[2] || match[3];
    if (modulePath) {
      imports.add(modulePath);
    }
  }

  // Python imports
  // Matches: from module import ... or import module
  const pythonImportRegex = /(?:from\s+([.\w]+)\s+import|import\s+([.\w]+))/g;
  while ((match = pythonImportRegex.exec(cleanContent)) !== null) {
    const modulePath = match[1] || match[2];
    if (modulePath && modulePath.startsWith('.')) {
      // Convert Python relative imports to path format
      imports.add(modulePath.replace(/\./g, '/'));
    }
  }

  // Java imports
  // Matches: import package.Class;
  const javaImportRegex = /import\s+([\w.]+);/g;
  while ((match = javaImportRegex.exec(cleanContent)) !== null) {
    const modulePath = match[1];
    if (modulePath && !modulePath.startsWith('java.') && !modulePath.startsWith('javax.')) {
      // Convert Java package to path format
      imports.add(modulePath.replace(/\./g, '/'));
    }
  }

  // Go imports
  // Matches: import "package" or import ( "package1" "package2" )
  const goImportRegex = /import\s+(?:\(([^)]+)\)|"([^"]+)")/g;
  while ((match = goImportRegex.exec(cleanContent)) !== null) {
    const importBlock = match[1] || match[2];
    if (importBlock) {
      const packageRegex = /"([^"]+)"/g;
      let pkgMatch;
      while ((pkgMatch = packageRegex.exec(importBlock)) !== null) {
        const pkg = pkgMatch[1];
        // Only include relative or project imports
        if (pkg.startsWith('.') || !pkg.includes('/')) {
          imports.add(pkg);
        }
      }
    }
  }

  // PHP includes/requires
  // Matches: require 'file.php', include 'file.php', use Namespace\Class
  const phpImportRegex = /(?:require|include|require_once|include_once)\s+['"]([^'"]+)['"]|use\s+([\w\\]+)/g;
  while ((match = phpImportRegex.exec(cleanContent)) !== null) {
    const modulePath = match[1] || match[2];
    if (modulePath) {
      if (modulePath.includes('\\')) {
        // Convert PHP namespace to path
        imports.add(modulePath.replace(/\\/g, '/'));
      } else {
        imports.add(modulePath);
      }
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
