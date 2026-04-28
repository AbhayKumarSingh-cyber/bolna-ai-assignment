import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Call from '../../models/Call';

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ calls: [] }, { status: 200 });
  }

  try {
    await dbConnect();
    const calls = await Call.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ calls }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('MongoDB read error:', message);
    return NextResponse.json({ calls: [] }, { status: 200 });
  }
}
