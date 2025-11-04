import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://buck-leading-pipefish.ngrok-free.app';

export async function GET(request: NextRequest) {
  const { pathname, search } = new URL(request.url);
  
  // Extract the path after /api/proxy/leave_cred
  const backendPath = pathname.replace('/api/proxy/leave_cred', '/leave_cred');
  
  const backendUrl = `${BACKEND_URL}${backendPath}${search}`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Leave credit proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave credits' },
      { status: 500 }
    );
  }
}