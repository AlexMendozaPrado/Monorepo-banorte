import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 *
 * Used by OpenShift/Kubernetes for:
 * - Liveness Probe: Is the app running?
 * - Readiness Probe: Is the app ready to accept traffic?
 * - Startup Probe: Has the app finished starting up?
 *
 * This endpoint should always respond quickly and not depend on external services.
 */
export async function GET() {
  try {
    // Basic health check - just verify the app is running
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      service: 'sentiment-analysis',
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    // If we can't even return a basic response, something is seriously wrong
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 } // Service Unavailable
    );
  }
}

// Support HEAD requests (some load balancers prefer these)
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
