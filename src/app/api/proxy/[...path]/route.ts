import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://buck-leading-pipefish.ngrok-free.app';

function filterResponseHeaders(headers: Headers) {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // skip hop-by-hop
    if (['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailers','transfer-encoding','upgrade'].includes(k)) return;
    out[key] = value;
  });
  return out;
}

async function handle(request: Request, ctx: any) {
  // Next.js requires awaiting the route context before using params in dynamic API routes
  const { params } = await ctx;
  const path = params?.path?.join('/') || '';
  const url = `${BACKEND}/${path}`;

  const init: RequestInit = {
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body: ['GET','HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()
  };

  const res = await fetch(url, init);
  const body = await res.arrayBuffer();
  const headers = filterResponseHeaders(res.headers);
  return new NextResponse(Buffer.from(body), { status: res.status, headers });
}

export async function GET(request: Request, ctx: any) { return handle(request, ctx); }
export async function POST(request: Request, ctx: any) { return handle(request, ctx); }
export async function PUT(request: Request, ctx: any) { return handle(request, ctx); }
export async function PATCH(request: Request, ctx: any) { return handle(request, ctx); }
export async function DELETE(request: Request, ctx: any) { return handle(request, ctx); }
export async function OPTIONS(request: Request, ctx: any) { return handle(request, ctx); }
