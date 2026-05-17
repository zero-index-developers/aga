import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@client/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json(db.aiHistory || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    const db = readDB();
    
    if (db.aiHistory) {
      db.aiHistory = db.aiHistory.filter((item: any) => !ids.includes(item.id));
      writeDB(db);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete AI history' }, { status: 500 });
  }
}
