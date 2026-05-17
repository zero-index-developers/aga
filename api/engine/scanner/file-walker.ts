import fs from 'fs/promises';
import path from 'path';

export async function walkDirectory(dir: string, rootPath: string, exclusions: string[] = []): Promise<string[]> {
  const results: string[] = [];
  let files: string[];

  try {
    files = await fs.readdir(dir);
  } catch (error) {
    console.error(`Failed to read directory: ${dir}`, error);
    return results; // Return empty for this directory and continue
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

    // Check if the current file or folder matches any exclusion
    if (exclusions.some(excl => file === excl || relPath.startsWith(excl + '/'))) {
      continue;
    }

    try {
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        const nestedFiles = await walkDirectory(fullPath, rootPath, exclusions);
        results.push(...nestedFiles);
      } else {
        // Only include TS/TSX files for now
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          results.push(relPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to stat file/dir: ${fullPath}`, error);
    }
  }

  return results;
}
