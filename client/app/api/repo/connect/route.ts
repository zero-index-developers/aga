import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@client/lib/db';

export async function POST(req: Request) {
  try {
    const { url, repoName } = await req.json();
    
    const db = readDB();

    const name = repoName || url.split('/').pop() || 'unknown-repo';
    
    const newRepo = {
      name,
      url,
      analytics: {
        nodes: 142,
        edges: 315,
        health: 92,
        lastScanned: new Date().toISOString()
      }
    };

    // Check if repo already exists
    const exists = db.repositories.find((r: any) => r.name === name);
    if (!exists) {
      db.repositories.push(newRepo);
    }
    
    db.activeRepo = name;

    writeDB(db);
    
    return NextResponse.json({ 
      success: true, 
      db: { 
        connectedRepo: name, 
        analytics: newRepo.analytics 
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect repository' }, { status: 500 });
  }
}
