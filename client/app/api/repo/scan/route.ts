import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scanProject } from '@api/engine/scanner';

const DB_PATH = path.join(process.cwd(), '../api/data', 'local-db.json');

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const rootPath = path.join(process.cwd(), '..'); // For now, we scan our own project

    const graph = await scanProject(rootPath);

    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ activeRepo: name, repositories: [] }, null, 2));
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const repoIndex = db.repositories.findIndex((r: any) => r.name === name);

    const newRepo = {
      name,
      url: 'local://aga',
      analytics: {
        nodes: graph.nodes.filter(n => n.type === 'custom').length,
        edges: graph.edges.length,
        health: 98,
        lastScanned: new Date().toISOString(),
      },
      graph,
    };

    if (repoIndex >= 0) {
      db.repositories[repoIndex] = newRepo;
    } else {
      db.repositories.push(newRepo);
    }

    db.activeRepo = name;
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, graph });
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
