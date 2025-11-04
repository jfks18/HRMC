import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://buck-leading-pipefish.ngrok-free.app';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Check if backend URL is configured
    // Temporarily disabled for testing
    // if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'production') {
    //   return NextResponse.json(
    //     { error: 'Backend service not configured. Please contact administrator.' },
    //     { status: 503 }
    //   );
    // }
    
    // Create AbortController for timeout (increased for Render)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for Render
    
    console.log('Attempting to connect to backend:', BACKEND);
    
    const res = await fetch(`${BACKEND}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Render-Frontend/1.0',
        'Accept': 'application/json',
        'Origin': 'https://hrmc.onrender.com'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    console.log('Backend response status:', res.status);
    
    clearTimeout(timeoutId);
    
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
    
  } catch (error: any) {
    console.error('Login API error:', error);
    console.error('Backend URL was:', BACKEND);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      cause: error.cause
    });
    
    // Handle different types of connection errors
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Connection timeout. Backend service is not responding. Please try again later.' },
        { status: 504 }
      );
    }
    
    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Backend service unavailable. Please try again later or contact support.' },
        { status: 503 }
      );
    }
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json(
        { error: 'Connection timeout. Backend service is not responding. Please check server status.' },
        { status: 504 }
      );
    }
    
    if (error.message?.includes('fetch failed') || error.message?.includes('Connect Timeout')) {
      return NextResponse.json(
        { error: 'Unable to connect to backend service. Please verify server is running.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
