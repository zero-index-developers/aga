import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

function getDb() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function GET() {
  try {
    const db = getDb();
    const activeRepoData = db.repositories.find((r: any) => r.name === db.activeRepo);
    
    return NextResponse.json({
      connectedRepo: db.activeRepo,
      analytics: activeRepoData?.analytics || { nodes: 0, edges: 0, health: 0, lastScanned: null }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}
