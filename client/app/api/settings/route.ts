import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@client/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json(db.settings || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newSettings = await request.json();
    const db = readDB();
    
    db.settings = {
      ...db.settings,
      ...newSettings
    };
    
    writeDB(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
