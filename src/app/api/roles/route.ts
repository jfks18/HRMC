import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://buck-leading-pipefish.ngrok-free.app';

export async function GET() {
  const res = await fetch(`${BACKEND}/roles/`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
