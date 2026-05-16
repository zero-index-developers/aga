import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

export async function POST(req: Request) {
  try {
    const { url, repoName } = await req.json();
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);

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

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
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
