import { NextResponse } from 'next/server';

// In-memory storage for votes (perfect for a single-event party)
let votes = [];
let isRunoff = false;
let runoffActresses = [];

export async function GET() {
  return NextResponse.json({ 
    votes,
    isRunoff,
    runoffActresses 
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, actresses } = body;

    if (!name || !actresses || !Array.isArray(actresses)) {
      return NextResponse.json(
        { error: 'Invalid vote data' },
        { status: 400 }
      );
    }

    // Check if name already exists (case-insensitive)
    const existingVote = votes.find(
      v => v.name.toLowerCase() === name.toLowerCase()
    );

    if (existingVote) {
      return NextResponse.json(
        { error: 'This name has already voted! Each person can only vote once.' },
        { status: 400 }
      );
    }

    const newVote = {
      name,
      actresses,
      timestamp: new Date().toISOString()
    };

    votes.push(newVote);

    return NextResponse.json({ success: true, vote: newVote });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { action, actresses } = body;

    if (action === 'startRunoff') {
      // Clear all votes and start runoff mode
      votes = [];
      isRunoff = true;
      runoffActresses = actresses || [];
      
      return NextResponse.json({ 
        success: true,
        isRunoff: true,
        runoffActresses 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  votes = [];
  isRunoff = false;
  runoffActresses = [];
  return NextResponse.json({ success: true });
}
