import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// KV Storage keys
const VOTES_KEY = 'red-carpet:votes';
const POLL_STATUS_KEY = 'red-carpet:pollStatus';
const TIEBREAKERS_KEY = 'red-carpet:tiebreakers';
const WINNERS_KEY = 'red-carpet:winners';

// Fallback in-memory storage for development (when KV is not configured)
let memoryVotes = {
  actresses: [],
  actors: []
};

let memoryPollStatus = {
  actressesOpen: true,
  actorsOpen: true
};

let memoryTiebreakers = {
  actresses: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] },
  actors: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] }
};

let memoryWinners = {
  actresses: null,
  actors: null
};

// Check if KV is configured
const isKVConfigured = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
};

// Helper functions for persistent storage
async function getVotes() {
  if (isKVConfigured()) {
    try {
      const data = await kv.get(VOTES_KEY);
      return data || { actresses: [], actors: [] };
    } catch (error) {
      console.error('KV get votes error:', error);
      return memoryVotes;
    }
  }
  return memoryVotes;
}

async function setVotes(votes) {
  if (isKVConfigured()) {
    try {
      await kv.set(VOTES_KEY, votes);
    } catch (error) {
      console.error('KV set votes error:', error);
    }
  }
  memoryVotes = votes;
}

async function getPollStatus() {
  if (isKVConfigured()) {
    try {
      const data = await kv.get(POLL_STATUS_KEY);
      return data || { actressesOpen: true, actorsOpen: true };
    } catch (error) {
      console.error('KV get poll status error:', error);
      return memoryPollStatus;
    }
  }
  return memoryPollStatus;
}

async function setPollStatus(status) {
  if (isKVConfigured()) {
    try {
      await kv.set(POLL_STATUS_KEY, status);
    } catch (error) {
      console.error('KV set poll status error:', error);
    }
  }
  memoryPollStatus = status;
}

async function getTiebreakers() {
  if (isKVConfigured()) {
    try {
      const data = await kv.get(TIEBREAKERS_KEY);
      return data || {
        actresses: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] },
        actors: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] }
      };
    } catch (error) {
      console.error('KV get tiebreakers error:', error);
      return memoryTiebreakers;
    }
  }
  return memoryTiebreakers;
}

async function setTiebreakers(tiebreakers) {
  if (isKVConfigured()) {
    try {
      await kv.set(TIEBREAKERS_KEY, tiebreakers);
    } catch (error) {
      console.error('KV set tiebreakers error:', error);
    }
  }
  memoryTiebreakers = tiebreakers;
}

async function getWinners() {
  if (isKVConfigured()) {
    try {
      const data = await kv.get(WINNERS_KEY);
      return data || { actresses: null, actors: null };
    } catch (error) {
      console.error('KV get winners error:', error);
      return memoryWinners;
    }
  }
  return memoryWinners;
}

async function setWinners(winners) {
  if (isKVConfigured()) {
    try {
      await kv.set(WINNERS_KEY, winners);
    } catch (error) {
      console.error('KV set winners error:', error);
    }
  }
  memoryWinners = winners;
}

export async function GET() {
  const votes = await getVotes();
  const pollStatus = await getPollStatus();
  const tiebreakers = await getTiebreakers();
  const winners = await getWinners();

  return NextResponse.json({
    votes,
    pollStatus,
    tiebreakers,
    winners
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
      const tiebreakers = await getTiebreakers();
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

      await setTiebreakers(tiebreakers);

      return NextResponse.json({ success: true, isTiebreaker: true });
    }

    // Regular vote handling
    const pollStatus = await getPollStatus();
    const votes = await getVotes();

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
    await setVotes(votes);

    return NextResponse.json({ success: true, vote: newVote });
  } catch (error) {
    console.error('POST error:', error);
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

      const pollStatus = await getPollStatus();
      pollStatus[`${category}Open`] = status;
      await setPollStatus(pollStatus);

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

      const tiebreakers = await getTiebreakers();
      tiebreakers[category] = {
        active: true,
        round: (tiebreakers[category]?.round || 0) + 1,
        votes: [],
        tiedChoices: tiedChoices || [],
        eligibleFingerprints: eligibleFingerprints || []
      };
      await setTiebreakers(tiebreakers);

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

      const tiebreakers = await getTiebreakers();
      tiebreakers[category] = {
        active: false,
        round: tiebreakers[category]?.round || 0,
        votes: [],
        tiedChoices: [],
        eligibleFingerprints: []
      };
      await setTiebreakers(tiebreakers);

      return NextResponse.json({
        success: true
      });
    }

    if (action === 'setWinner') {
      const { winner } = body;

      if (!['actresses', 'actors'].includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }

      if (!winner) {
        return NextResponse.json(
          { error: 'Winner is required' },
          { status: 400 }
        );
      }

      const winners = await getWinners();
      winners[category] = winner;
      await setWinners(winners);

      return NextResponse.json({
        success: true,
        winners
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const votes = {
    actresses: [],
    actors: []
  };
  const pollStatus = {
    actressesOpen: true,
    actorsOpen: true
  };
  const tiebreakers = {
    actresses: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] },
    actors: { active: false, round: 0, votes: [], tiedChoices: [], eligibleFingerprints: [] }
  };
  const winners = {
    actresses: null,
    actors: null
  };

  await setVotes(votes);
  await setPollStatus(pollStatus);
  await setTiebreakers(tiebreakers);
  await setWinners(winners);

  return NextResponse.json({ success: true });
}
