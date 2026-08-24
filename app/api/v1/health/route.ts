import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      version: 'v1',
      status: 'ok',
      service: 'medibill-pro-v1-api',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
