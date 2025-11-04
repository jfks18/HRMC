import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  const res = await fetch(`${BACKEND}/users`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
