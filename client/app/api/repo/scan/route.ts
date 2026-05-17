import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@client/lib/db';
import path from 'path';
import { scanProject } from '@api/engine/scanner';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const rootPath = path.join(process.cwd(), '..'); // For now, we scan our own project

    const db = readDB();
    const exclusions = db.settings?.scanner?.exclusions || [];

    const result = await scanProject(rootPath, { exclusions });

    const repoIndex = db.repositories.findIndex((r: any) => r.name === name);

    const newRepo = {
      name,
      url: 'local://aga',
      analytics: {
        nodes: result.nodes.filter(n => n.type === 'custom').length,
        edges: result.edges.length,
        health: result.healthScore,
        lastScanned: new Date().toISOString(),
      },
      graph: { nodes: result.nodes, edges: result.edges },
    };

    if (repoIndex >= 0) {
      db.repositories[repoIndex] = newRepo;
    } else {
      db.repositories.push(newRepo);
    }

    db.activeRepo = name;
    writeDB(db);

    return NextResponse.json({ success: true, graph: { nodes: result.nodes, edges: result.edges } });
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
