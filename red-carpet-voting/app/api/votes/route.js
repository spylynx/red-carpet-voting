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

// Tiebreaker storage
let tiebreakers = {
  actresses: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] },
  actors: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] }
};

export async function GET() {
  return NextResponse.json({
    votes,
    pollStatus,
    tiebreakers
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, name, selections, fingerprint, isTiebreaker } = body;

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

    // Handle tiebreaker vote
    if (isTiebreaker) {
      const tiebreaker = tiebreakers[category];

      if (!tiebreaker.active) {
        return NextResponse.json(
          { error: 'No active tiebreaker for this category' },
          { status: 400 }
        );
      }

      // Check if voter is eligible (based on fingerprint)
      if (!tiebreaker.eligibleFingerprints.includes(fingerprint)) {
        return NextResponse.json(
          { error: 'You are not eligible to vote in this tiebreaker round' },
          { status: 403 }
        );
      }

      // Check if already voted in this tiebreaker round (based on fingerprint)
      const alreadyVoted = tiebreaker.votes.some(v => v.fingerprint === fingerprint);
      if (alreadyVoted) {
        return NextResponse.json(
          { error: 'You have already voted in this tiebreaker round!' },
          { status: 400 }
        );
      }

      // Tiebreaker vote should be for ONE choice only
      if (selections.length !== 1) {
        return NextResponse.json(
          { error: 'Please select exactly ONE choice for tiebreaker' },
          { status: 400 }
        );
      }

      // Must be one of the tied choices
      if (!tiebreaker.tiedChoices.includes(selections[0])) {
        return NextResponse.json(
          { error: 'Invalid choice for tiebreaker' },
          { status: 400 }
        );
      }

      tiebreaker.votes.push({
        name,
        selection: selections[0],
        fingerprint,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, isTiebreaker: true });
    }

    // Regular vote handling
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
    const { action, category, status, tiedChoices, eligibleFingerprints } = body;

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

    if (action === 'startTiebreaker') {
      if (!['actresses', 'actors'].includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }

      tiebreakers[category] = {
        active: true,
        round: (tiebreakers[category]?.round || 0) + 1,
        votes: [],
        tiedChoices: tiedChoices || [],
        eligibleFingerprints: eligibleFingerprints || []
      };

      return NextResponse.json({
        success: true,
        tiebreaker: tiebreakers[category]
      });
    }

    if (action === 'resolveTiebreaker') {
      if (!['actresses', 'actors'].includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }

      tiebreakers[category] = {
        active: false,
        round: tiebreakers[category]?.round || 0,
        votes: [],
        tiedChoices: [],
        eligibleFingerprints: []
      };

      return NextResponse.json({
        success: true
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
  tiebreakers = {
    actresses: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] },
    actors: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] }
  };
  return NextResponse.json({ success: true });
}
