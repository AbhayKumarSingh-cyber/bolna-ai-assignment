/*import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    // 1. Debugging: This will print in your VS Code terminal
    console.log("Attempting call to:", phoneNumber);
    console.log("Using Agent ID:", process.env.BOLNA_AGENT_ID);

    // 2. The API Request
    // app/api/trigger-call/route.ts

// Change this line from /v1/call to /v2/call
// app/api/trigger-call/route.ts

// Try this URL - it's the 2026 global trigger
const response = await fetch('https://api.bolna.ai/call', { 
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.BOLNA_API_KEY?.trim()}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agent_id: process.env.BOLNA_AGENT_ID?.trim(),
    recipient_phone_number: phoneNumber,
    user_data: {
      name: "Abhay Singh"
    }
  }),
});

    const data = await response.json();
    
    // 3. Log the response status for troubleshooting
    console.log("Bolna API Status:", response.status);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to trigger call" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Server Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Call from '@/app/models/Call'; // Path adjusted for your 'app/models' folder

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    // 1. Trigger the Call via Bolna
    const response = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BOLNA_API_KEY?.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: process.env.BOLNA_AGENT_ID?.trim(),
        recipient_phone_number: phoneNumber,
        user_data: { name: "Abhay Singh" }
      }),
    });

    const data = await response.json();

    // 2. If Bolna is successful, save to MongoDB
    if (response.ok) {
      try {
        await dbConnect();
        const newCall = await Call.create({
          phoneNumber: phoneNumber,
          agentId: process.env.BOLNA_AGENT_ID,
          status: 'success'
        });
        console.log("Database Record Created:", newCall._id);
      } catch (dbError) {
        console.error("MongoDB Error:", dbError);
        // We don't block the response if only the DB fails
      }
      
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json(
        { success: false, error: data.message || "Bolna API Error" },
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error("Server Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Call from '@/app/models/Call';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    console.log("--- API DEBUG: Connecting to MongoDB ---");
    await dbConnect();
    
    console.log("--- API DEBUG: Fetching Calls ---");
    const calls = await Call.find({}).sort({ createdAt: -1 }).limit(10);
    
    console.log(`--- API DEBUG: Found ${calls.length} calls ---`);
    return NextResponse.json({ calls }, { status: 200 });
  } catch (error: any) {
    console.error("--- API ERROR: ---", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} */

import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Call from '../../models/Call';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    const response = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BOLNA_API_KEY?.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: process.env.BOLNA_AGENT_ID?.trim(),
        recipient_phone_number: phoneNumber,
        user_data: { name: 'Abhay Singh' },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      if (process.env.MONGODB_URI) {
        try {
          await dbConnect();
          await Call.create({
            phoneNumber,
            agentId: process.env.BOLNA_AGENT_ID ?? '',
            status: 'success',
          });
        } catch (dbError) {
          console.error('MongoDB Error:', dbError);
        }
      } else {
        console.warn('Skipping MongoDB save because MONGODB_URI is not configured.');
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, error: data.message || 'Bolna API Error' },
      { status: response.status }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('Server Error:', message);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}