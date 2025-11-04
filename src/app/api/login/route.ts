import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Check if backend URL is configured
    if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Backend service not configured. Please contact administrator.' },
        { status: 503 }
      );
    }
    
    const res = await fetch(`${BACKEND}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
    
  } catch (error: any) {
    console.error('Login API error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Backend service unavailable. Please try again later or contact support.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
