import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoName = searchParams.get('name');

    if (!fs.existsSync(DB_PATH)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    // If specific repo requested, find it
    if (repoName) {
      const repo = db.repositories.find((r: any) => r.name === repoName);
      if (repo) {
        return NextResponse.json(repo.graph || { nodes: [], edges: [] });
      }
    }

    // Otherwise return active repo's graph
    const activeRepo = db.repositories.find((r: any) => r.name === db.activeRepo);
    return NextResponse.json(activeRepo?.graph || { nodes: [], edges: [] });
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch graph' }, { status: 500 });
  }
}
