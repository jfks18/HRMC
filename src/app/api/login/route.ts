import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
