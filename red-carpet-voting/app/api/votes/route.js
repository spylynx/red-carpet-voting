import { NextResponse } from 'next/server';

// In-memory storage
let votes = {
  actresses: [],
  actors: []
};

let pollStatus = {
  actressesOpen: true,
  actorsOpen: true
};

export async function GET() {
  return NextResponse.json({ 
    votes,
    pollStatus
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, name, selections, fingerprint } = body;

    if (!category || !name || !selections || !Array.isArray(selections) || !fingerprint) {
      return NextResponse.json(
        { error: 'Invalid vote data' },
        { status: 400 }
      );
    }

    if (!['actresses', 'actors'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Check if poll is open
    if (!pollStatus[`${category}Open`]) {
      return NextResponse.json(
        { error: 'This poll is currently closed' },
        { status: 403 }
      );
    }

    // Check if fingerprint already voted in this category
    const existingVoteByFingerprint = votes[category].find(
      v => v.fingerprint === fingerprint
    );

    if (existingVoteByFingerprint) {
      return NextResponse.json(
        { error: 'You have already voted in this category from this device!' },
        { status: 400 }
      );
    }

    // Check if name already exists (secondary check)
    const existingVoteByName = votes[category].find(
      v => v.name.toLowerCase() === name.toLowerCase()
    );

    if (existingVoteByName) {
      return NextResponse.json(
        { error: 'This name has already voted in this category!' },
        { status: 400 }
      );
    }

    const newVote = {
      name,
      selections,
      fingerprint,
      timestamp: new Date().toISOString()
    };

    votes[category].push(newVote);

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
    const { action, category, status } = body;

    if (action === 'togglePoll') {
      if (!['actresses', 'actors'].includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }

      pollStatus[`${category}Open`] = status;
      
      return NextResponse.json({ 
        success: true,
        pollStatus 
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
  votes = {
    actresses: [],
    actors: []
  };
  pollStatus = {
    actressesOpen: true,
    actorsOpen: true
  };
  return NextResponse.json({ success: true });
}
