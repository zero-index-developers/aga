import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

export async function GET() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    return NextResponse.json(db.repositories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}
