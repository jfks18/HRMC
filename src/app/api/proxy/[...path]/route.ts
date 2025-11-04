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
  try {
    // Next.js requires awaiting the route context before using params in dynamic API routes
    const { params } = await ctx;
    const path = params?.path?.join('/') || '';
    const url = `${BACKEND}/${path}`;

    // Check if backend is configured in production
    // Temporarily disabled - using fallback URL
    // if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'production') {
    //   return NextResponse.json(
    //     { error: 'Backend service not configured' },
    //     { status: 503 }
    //   );
    // }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const init: RequestInit = {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: ['GET','HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      signal: controller.signal
    };

    const res = await fetch(url, init);
    clearTimeout(timeoutId);
    const body = await res.arrayBuffer();
    const headers = filterResponseHeaders(res.headers);
    return new NextResponse(Buffer.from(body), { status: res.status, headers });
    
  } catch (error: any) {
    console.error('Proxy API error:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Backend service timeout', details: 'Request timed out after 5 seconds' },
        { status: 504 }
      );
    }
    
    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Backend service unavailable', details: 'Connection refused' },
        { status: 503 }
      );
    }
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json(
        { error: 'Backend service timeout', details: 'Connection timeout' },
        { status: 504 }
      );
    }
    
    if (error.message?.includes('fetch failed') || error.message?.includes('Connect Timeout')) {
      return NextResponse.json(
        { error: 'Backend service unreachable', details: 'Unable to connect to backend server' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Proxy request failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, ctx: any) { return handle(request, ctx); }
export async function POST(request: Request, ctx: any) { return handle(request, ctx); }
export async function PUT(request: Request, ctx: any) { return handle(request, ctx); }
export async function PATCH(request: Request, ctx: any) { return handle(request, ctx); }
export async function DELETE(request: Request, ctx: any) { return handle(request, ctx); }
export async function OPTIONS(request: Request, ctx: any) { return handle(request, ctx); }
