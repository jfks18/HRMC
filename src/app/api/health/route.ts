import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      backend_configured: !!process.env.BACKEND_URL,
      services: {
        frontend: 'healthy',
        backend: 'unknown' as string
      }
    };

    // Check if backend is reachable (optional)
    if (process.env.BACKEND_URL) {
      try {
        const backendResponse = await fetch(`${process.env.BACKEND_URL}/`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        health.services.backend = backendResponse.ok ? 'healthy' : 'unhealthy';
      } catch {
        health.services.backend = 'unreachable';
      }
    } else {
      health.services.backend = 'not_configured';
    }

    const statusCode = health.services.backend === 'healthy' ? 200 : 207; // 207 = Multi-Status
    return NextResponse.json(health, { status: statusCode });
    
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
}