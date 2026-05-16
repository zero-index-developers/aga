import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), '../api/data', 'local-db.json');

async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeDB(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.aiHistory || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    const db = await readDB();
    
    if (db.aiHistory) {
      db.aiHistory = db.aiHistory.filter((item: any) => !ids.includes(item.id));
      await writeDB(db);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete AI history' }, { status: 500 });
  }
}
