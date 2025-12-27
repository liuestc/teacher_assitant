
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';


const DB_PATH = path.join(process.cwd(), 'data/db.json');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const records = JSON.parse(data);
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error reading records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}
