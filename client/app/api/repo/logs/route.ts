import { NextResponse } from 'next/server';
import { readDB } from '@client/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json(db.scanLogs || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
