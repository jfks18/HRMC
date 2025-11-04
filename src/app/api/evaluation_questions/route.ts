import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  const res = await fetch(`${BACKEND}/evaluation_questions`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
