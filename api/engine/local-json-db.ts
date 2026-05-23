import fs from 'fs';
import path from 'path';

// TODO(architecture): This legacy local JSON helper is currently unused. Keep it in the
// backend-owned tree if a future demo adapter still needs file-backed state.
export const DB_PATH = path.join(process.cwd(), '../api/data', 'local-db.json');

export function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { activeRepo: null, repositories: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export function writeDB(data: any) {
  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
