import { NextResponse } from 'next/server';
import { TASKS } from '@/lib/tasks';

export async function GET() {
  return NextResponse.json({ tasks: TASKS });
}
