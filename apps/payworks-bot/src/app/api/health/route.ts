import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'payworks-bot',
    timestamp: new Date().toISOString(),
  });
}
