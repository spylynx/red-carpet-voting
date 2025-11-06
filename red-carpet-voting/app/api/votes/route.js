import { NextResponse } from 'next/server';

// In-memory storage for votes (perfect for a single-event party)
let votes = [];

export async function GET() {
  return NextResponse.json({ votes });
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

export async function DELETE() {
  votes = [];
  return NextResponse.json({ success: true });
}