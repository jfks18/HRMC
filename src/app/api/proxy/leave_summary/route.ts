import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://buck-leading-pipefish.ngrok-free.app';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  
  const backendUrl = `${BACKEND_URL}/leave_summary?year=${year}`;

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
    console.error('Leave summary proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave summary' },
      { status: 500 }
    );
  }
}