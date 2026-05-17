import { NextResponse } from 'next/server';
import { readDB } from '@client/lib/db';

function getDb() {
  return readDB();
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
