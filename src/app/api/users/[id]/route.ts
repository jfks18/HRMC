import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://buck-leading-pipefish.ngrok-free.app';

export async function GET(req: Request, { params }: any) {
  const { id } = params;
  const res = await fetch(`${BACKEND}/users/${id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request, { params }: any) {
  const { id } = params;
  const res = await fetch(`${BACKEND}/users/${id}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: Request, { params }: any) {
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
