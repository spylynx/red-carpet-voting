'use client';

import { useState, useEffect } from 'react';

const actresses = [
  "Audrey Hepburn", "Marilyn Monroe", "Elizabeth Taylor", "Sophia Loren",
  "Claudia Cardinale", "Brigitte Bardot", "Jane Fonda", "Catherine Deneuve",
  "Ornella Muti", "Monica Bellucci", "Isabelle Adjani", "Lucy Liu",
  "Anita Ekberg", "Margot Robbie", "Julia Roberts", "Nicole Kidman",
  "Cate Blanchett", "Charlize Theron", "Natalie Portman", "Angelina Jolie",
  "Halle Berry", "Scarlett Johansson", "Penelope Cruz", "Emma Stone", "Grace Kelly"
];

const actors = [
  "Marlon Brando", "Ryan Gosling", "James Dean", "George Clooney", "Matthew McConaughey",
  "Alain Delon", "Jean-Paul Belmondo", "Keanu Reeves", "Marcello Mastroianni", "Al Pacino",
  "Robert De Niro", "Jack Nicholson", "Clint Eastwood", "Paul Newman", "Harrison Ford",
  "Jean Dujardin", "Leonardo DiCaprio", "Brad Pitt", "Robert Redford", "Johnny Depp",
  "Patrick Swayze", "Tom Cruise", "Pedro Pascal", "Sean Connery", "Denzel Washington"
];

const ADMIN_PIN = "2025";

const StarIcon = ({ size = 24, fill = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TrophyIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 3h12v3H6V3zm1 4h10v7c0 2.21-1.79 4-4 4h-2c-2.21 0-4-1.79-4-4V7zm5 13c.55 0 1 .45 1 1v1h-2v-1c0-.55.45-1 1-1zm-3-1h6l-1 1H9l-1-1z"/>
    <path d="M4 5h2v3c0 1.5-.5 2-2 2V5zm14 0h2v5c-1.5 0-2-.5-2-2V5z"/>
  </svg>
);

const UsersIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ChartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
);

const LockIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const SparklesIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
    <path d="M19 12l.75 2.25L22 15l-2.25.75L19 18l-.75-2.25L16 15l2.25-.75L19 12z"/>
    <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z"/>
  </svg>
);

const AwardIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="9" r="5"/>
    <path d="M16 11l1 8h-2l-3-3-3 3H7l1-8"/>
  </svg>
);

// Browser fingerprinting
const getBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('fingerprint', 2, 2);

  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('###');

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'fp_' + Math.abs(hash).toString(36);
};

export default function RedCarpetVoting() {
  const [view, setView] = useState('home');
  const [category, setCategory] = useState(null);
  const [voterName, setVoterName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [pollStatus, setPollStatus] = useState({ actressesOpen: true, actorsOpen: true });
  const [votes, setVotes] = useState({ actresses: [], actors: [] });
  const [hasVoted, setHasVoted] = useState({ actresses: false, actors: false });
  const [fingerprint, setFingerprint] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinAction, setPinAction] = useState(null);

  // Spinning wheel states for both categories
  const [isSpinning, setIsSpinning] = useState({ actresses: false, actors: false });
  const [winner, setWinner] = useState({ actresses: null, actors: null });
  const [spinRotation, setSpinRotation] = useState({ actresses: 0, actors: 0 });

  // Tiebreaker states
  const [tiebreakers, setTiebreakers] = useState({ actresses: null, actors: null });
  const [tiebreakerChoice, setTiebreakerChoice] = useState(null);

  useEffect(() => {
    const fp = getBrowserFingerprint();
    setFingerprint(fp);

    // Load voter name from localStorage
    const savedName = localStorage.getItem('voterName');
    if (savedName) {
      setVoterName(savedName);
    }

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/votes');
      const data = await response.json();
      setVotes(data.votes || { actresses: [], actors: [] });
      setPollStatus(data.pollStatus || { actressesOpen: true, actorsOpen: true });
      setTiebreakers(data.tiebreakers || { actresses: null, actors: null });
      setWinner(data.winners || { actresses: null, actors: null });

      const fp = fingerprint || getBrowserFingerprint();
      const actressVoted = data.votes?.actresses?.some(v => v.fingerprint === fp) || false;
      const actorVoted = data.votes?.actors?.some(v => v.fingerprint === fp) || false;
      setHasVoted({ actresses: actressVoted, actors: actorVoted });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else if (selectedItems.length < 5) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const submitVote = async () => {
    if (!voterName.trim() || selectedItems.length === 0) {
      alert('Please enter your name and select at least one option!');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: voterName.trim(),
          selections: selectedItems,
          fingerprint
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save voter name to localStorage for persistence
        localStorage.setItem('voterName', voterName.trim());

        alert('Thank you for voting! 🌟');
        setSelectedItems([]);
        setView('dashboard');
        loadData();
      } else {
        alert(data.error || 'Failed to submit vote');
      }
    } catch (error) {
      alert('Failed to submit vote. Please try again.');
    }
  };

  const calculateResults = (cat) => {
    const items = cat === 'actresses' ? actresses : actors;
    const categoryVotes = votes[cat] || [];

    const itemVotes = {};
    items.forEach(item => {
      itemVotes[item] = { count: 0, voters: [], percentage: 0 };
    });

    categoryVotes.forEach(vote => {
      vote.selections.forEach(item => {
        if (itemVotes[item]) {
          itemVotes[item].count++;
          itemVotes[item].voters.push(vote.name);
        }
      });
    });

    const totalVotes = Object.values(itemVotes).reduce((sum, item) => sum + item.count, 0);
    Object.keys(itemVotes).forEach(item => {
      itemVotes[item].percentage = totalVotes > 0 ? (itemVotes[item].count / totalVotes) * 100 : 0;
    });

    return Object.entries(itemVotes)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate tiebreaker results
  const calculateTiebreakerResults = (cat) => {
    const tiebreaker = tiebreakers[cat];
    if (!tiebreaker || !tiebreaker.active) return null;

    const tiebreakerVotes = {};
    tiebreaker.tiedChoices.forEach(choice => {
      tiebreakerVotes[choice] = { count: 0, voters: [] };
    });

    tiebreaker.votes.forEach(vote => {
      if (tiebreakerVotes[vote.selection]) {
        tiebreakerVotes[vote.selection].count++;
        tiebreakerVotes[vote.selection].voters.push(vote.name);
      }
    });

    return Object.entries(tiebreakerVotes)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  };

  // Start tiebreaker round
  const startTiebreaker = async (cat) => {
    const results = calculateResults(cat);
    const maxCount = results[0]?.count || 0;
    const tiedChoices = results.filter(r => r.count === maxCount && r.count > 0);

    if (tiedChoices.length <= 1) {
      alert('No tie to break!');
      return;
    }

    // Get all fingerprints who voted for any of the tied choices
    const eligibleFingerprints = [];
    votes[cat].forEach(vote => {
      const votedForTiedChoice = vote.selections.some(selection =>
        tiedChoices.find(tc => tc.name === selection)
      );
      if (votedForTiedChoice && !eligibleFingerprints.includes(vote.fingerprint)) {
        eligibleFingerprints.push(vote.fingerprint);
      }
    });

    try {
      await fetch('/api/votes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'startTiebreaker',
          category: cat,
          tiedChoices: tiedChoices.map(tc => tc.name),
          eligibleFingerprints
        }),
      });
      loadData();
      alert(`Tiebreaker started! ${eligibleFingerprints.length} voters are eligible to vote.`);
    } catch (error) {
      alert('Failed to start tiebreaker');
    }
  };

  // Submit tiebreaker vote
  const submitTiebreakerVote = async (cat) => {
    if (!tiebreakerChoice) {
      alert('Please select one option!');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cat,
          name: voterName,
          selections: [tiebreakerChoice],
          fingerprint,
          isTiebreaker: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Tiebreaker vote submitted! 🌟');
        setTiebreakerChoice(null);
        await loadData();

        // Check if all eligible voters have voted, and auto-resolve if so
        setTimeout(async () => {
          const latestResponse = await fetch('/api/votes');
          const latestData = await latestResponse.json();
          const currentTiebreaker = latestData.tiebreakers?.[cat];

          if (currentTiebreaker && currentTiebreaker.active) {
            const allVoted = currentTiebreaker.votes.length === currentTiebreaker.eligibleFingerprints.length;

            if (allVoted) {
              // Auto-resolve the tiebreaker
              await autoResolveTiebreaker(cat);
            }
          }
        }, 500);
      } else {
        alert(data.error || 'Failed to submit tiebreaker vote');
      }
    } catch (error) {
      alert('Failed to submit tiebreaker vote. Please try again.');
    }
  };

  // Auto-resolve tiebreaker when all eligible voters have voted
  const autoResolveTiebreaker = async (cat) => {
    const tiebreakerResults = calculateTiebreakerResults(cat);
    if (!tiebreakerResults || tiebreakerResults.length === 0) {
      return;
    }

    const maxCount = tiebreakerResults[0].count;
    const stillTied = tiebreakerResults.filter(r => r.count === maxCount && r.count > 0);

    if (stillTied.length > 1) {
      // Still a tie, start another round automatically
      const eligibleFingerprints = tiebreakers[cat].eligibleFingerprints;

      try {
        await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'startTiebreaker',
            category: cat,
            tiedChoices: stillTied.map(tc => tc.name),
            eligibleFingerprints
          }),
        });
        loadData();
        alert(`Still tied between ${stillTied.map(tc => tc.name).join(' and ')}!\n\nStarting Round ${(tiebreakers[cat]?.round || 0) + 1}.\n\nPlease vote again to break the tie!`);
      } catch (error) {
        console.error('Failed to start new tiebreaker round', error);
      }
    } else {
      // We have a winner! End the tiebreaker
      try {
        await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'resolveTiebreaker',
            category: cat
          }),
        });
        loadData();
        alert(`🎉 Tiebreaker resolved!\n\nWinner: ${tiebreakerResults[0].name}\n\nYou can now spin the wheel to select the prize winner!`);
      } catch (error) {
        console.error('Failed to resolve tiebreaker', error);
      }
    }
  };

  // Resolve tiebreaker and check if we need another round
  const resolveTiebreaker = async (cat) => {
    const tiebreakerResults = calculateTiebreakerResults(cat);
    if (!tiebreakerResults || tiebreakerResults.length === 0) {
      alert('No tiebreaker votes yet!');
      return;
    }

    const maxCount = tiebreakerResults[0].count;
    const stillTied = tiebreakerResults.filter(r => r.count === maxCount && r.count > 0);

    if (stillTied.length > 1) {
      // Still a tie, start another round
      const eligibleFingerprints = tiebreakers[cat].eligibleFingerprints;

      try {
        await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'startTiebreaker',
            category: cat,
            tiedChoices: stillTied.map(tc => tc.name),
            eligibleFingerprints
          }),
        });
        loadData();
        alert(`Still tied! Starting round ${(tiebreakers[cat]?.round || 0) + 1}`);
      } catch (error) {
        alert('Failed to start new tiebreaker round');
      }
    } else {
      // We have a winner!
      try {
        await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'resolveTiebreaker',
            category: cat
          }),
        });
        loadData();
        alert(`Tiebreaker resolved! Winner: ${tiebreakerResults[0].name}`);
      } catch (error) {
        alert('Failed to resolve tiebreaker');
      }
    }
  };

  // Spinning wheel function for winner selection (admin only)
  const spinWheel = async (cat) => {
    // Check if there's an active tiebreaker
    if (tiebreakers[cat]?.active) {
      alert('Please resolve the tiebreaker first!');
      return;
    }

    const results = calculateResults(cat);

    // Check if there's still a tie at the top
    const maxCount = results[0]?.count || 0;
    const topChoices = results.filter(r => r.count === maxCount && r.count > 0);

    if (topChoices.length === 0 || topChoices[0].voters.length === 0) {
      alert('No votes yet!');
      return;
    }

    if (topChoices.length > 1) {
      alert(`There's a tie! Please start a tiebreaker round first.`);
      return;
    }

    // We have a clear winner
    const selectedChoice = topChoices[0];

    setIsSpinning({ ...isSpinning, [cat]: true });
    const spins = 5 + Math.random() * 3;
    const extraRotation = Math.random() * 360;
    const totalRotation = spins * 360 + extraRotation;

    setSpinRotation({ ...spinRotation, [cat]: totalRotation });

    setTimeout(async () => {
      const randomWinner = selectedChoice.voters[Math.floor(Math.random() * selectedChoice.voters.length)];

      // Save winner to backend
      try {
        await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'setWinner',
            category: cat,
            winner: randomWinner
          }),
        });
      } catch (error) {
        console.error('Failed to save winner:', error);
      }

      setWinner({ ...winner, [cat]: randomWinner });
      setIsSpinning({ ...isSpinning, [cat]: false });
    }, 4000);
  };

  const handleAdminAction = (action) => {
    setPinAction(action);
    setShowPinPrompt(true);
  };

  const verifyPinAndExecute = async () => {
    if (pinInput !== ADMIN_PIN) {
      alert('Incorrect PIN!');
      setPinInput('');
      return;
    }

    setShowPinPrompt(false);
    setPinInput('');

    if (pinAction?.type === 'togglePoll') {
      try {
        await fetch('/api/votes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'togglePoll',
            category: pinAction.category,
            status: !pollStatus[`${pinAction.category}Open`]
          }),
        });
        loadData();
      } catch (error) {
        alert('Failed to update poll status');
      }
    } else if (pinAction?.type === 'startTiebreaker') {
      await startTiebreaker(pinAction.category);
    } else if (pinAction?.type === 'resolveTiebreaker') {
      await resolveTiebreaker(pinAction.category);
    } else if (pinAction?.type === 'spinWheel') {
      await spinWheel(pinAction.category);
    } else if (pinAction?.type === 'reset') {
      if (confirm('Reset ALL votes? This cannot be undone!')) {
        try {
          await fetch('/api/votes', { method: 'DELETE' });
          setWinner({ actresses: null, actors: null });
          setSpinRotation({ actresses: 0, actors: 0 });
          loadData();
          setView('home');
        } catch (error) {
          alert('Failed to reset');
        }
      }
    }
    setPinAction(null);
  };

  const startVoting = (cat) => {
    const isOpen = pollStatus[`${cat}Open`];
    const voted = hasVoted[cat];

    if (!isOpen) {
      alert('This poll is currently closed by the host.');
      return;
    }

    if (voted) {
      alert('You have already voted in this category from this device!');
      return;
    }

    setCategory(cat);
    setView('vote');
  };

  if (view === 'vote') {
    const items = category === 'actresses' ? actresses : actors;
    const color = category === 'actresses' ? 'yellow' : 'blue';

    return (
      <div className={`min-h-screen bg-gradient-to-br from-${color === 'yellow' ? 'purple' : 'blue'}-900 via-${color === 'yellow' ? 'red' : 'purple'}-900 to-black text-white p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-${color}-400 to-pink-500 bg-clip-text text-transparent mb-2`}>
              Vote for Best {category === 'actresses' ? 'Actress' : 'Actor'}
            </h1>
            <p className="text-xl text-gray-300">Select up to 5 favorites</p>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl">
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2 text-yellow-400">Your Name</label>
              <input
                type="text"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-yellow-500/50 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3 text-yellow-400">
                Select Your Top 5 ({selectedItems.length}/5)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  const isFull = selectedItems.length >= 5 && !isSelected;

                  return (
                    <button
                      key={item}
                      onClick={() => toggleItem(item)}
                      disabled={isFull}
                      className={`p-4 rounded-lg text-left transition-all ${
                        isSelected
                          ? `bg-gradient-to-r from-${color}-500 to-pink-500 text-white shadow-lg scale-105`
                          : isFull
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-yellow-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item}</span>
                        {isSelected && <StarIcon size={20} fill={true} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setView('home');
                  setSelectedItems([]);
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitVote}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                Submit Vote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tiebreaker voting view
  if (view === 'tiebreaker') {
    const tiebreaker = tiebreakers[category];
    if (!tiebreaker || !tiebreaker.active) {
      setView('dashboard');
      return null;
    }

    const color = category === 'actresses' ? 'yellow' : 'blue';
    const isEligible = tiebreaker.eligibleFingerprints?.includes(fingerprint);
    const hasVotedInTiebreaker = tiebreaker.votes.some(v => v.fingerprint === fingerprint);

    return (
      <div className={`min-h-screen bg-gradient-to-br from-${color === 'yellow' ? 'purple' : 'blue'}-900 via-${color === 'yellow' ? 'red' : 'purple'}-900 to-black text-white p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-${color}-400 to-pink-500 bg-clip-text text-transparent mb-2`}>
              🔥 TIEBREAKER ROUND {tiebreaker.round} 🔥
            </h1>
            <p className="text-xl text-gray-300">Vote for ONE {category === 'actresses' ? 'actress' : 'actor'} to break the tie!</p>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl">
            <div className="mb-6 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
              <p className="text-yellow-400 font-semibold mb-2">Tied Choices:</p>
              <p className="text-white">{tiebreaker.tiedChoices.join(', ')}</p>
              <p className="text-sm text-gray-300 mt-2">
                Only voters who voted for these choices can participate: {tiebreaker.eligibleFingerprints?.length || 0} eligible voters
              </p>
            </div>

            {!isEligible ? (
              <div className="p-6 bg-red-500/20 rounded-lg border border-red-500/50 text-center">
                <p className="text-red-400 text-lg font-bold">You are not eligible to vote in this tiebreaker.</p>
                <p className="text-gray-300 mt-2">Only voters who originally voted for one of the tied choices can participate.</p>
                <button
                  onClick={() => setView('dashboard')}
                  className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : hasVotedInTiebreaker ? (
              <div className="p-6 bg-green-500/20 rounded-lg border border-green-500/50 text-center">
                <p className="text-green-400 text-lg font-bold">✓ You have voted in this tiebreaker round!</p>
                <p className="text-gray-300 mt-2">Waiting for other voters...</p>
                <button
                  onClick={() => setView('dashboard')}
                  className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-lg font-semibold mb-3 text-yellow-400">
                    Select ONE Option to Break the Tie
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tiebreaker.tiedChoices.map((choice) => {
                      const isSelected = tiebreakerChoice === choice;

                      return (
                        <button
                          key={choice}
                          onClick={() => setTiebreakerChoice(choice)}
                          className={`p-4 rounded-lg text-left transition-all ${
                            isSelected
                              ? `bg-gradient-to-r from-${color}-500 to-pink-500 text-white shadow-lg scale-105`
                              : 'bg-white/10 hover:bg-white/20 text-white border border-yellow-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{choice}</span>
                            {isSelected && <StarIcon size={20} fill={true} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setView('dashboard');
                      setTiebreakerChoice(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitTiebreakerVote(category)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
                  >
                    Submit Tiebreaker Vote
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    const actressResults = calculateResults('actresses');
    const actorResults = calculateResults('actors');
    const maxBubbleSize = 150;
    const minBubbleSize = 50;

    // Check if user is eligible for any active tiebreaker (based on fingerprint)
    const isEligibleForActressesTiebreaker = tiebreakers.actresses?.active &&
      tiebreakers.actresses.eligibleFingerprints?.includes(fingerprint);
    const isEligibleForActorsTiebreaker = tiebreakers.actors?.active &&
      tiebreakers.actors.eligibleFingerprints?.includes(fingerprint);
    const hasActiveTiebreaker = tiebreakers.actresses?.active || tiebreakers.actors?.active;

    // Render spinning wheel component
    const renderSpinningWheel = (cat, results, color) => {
      const topChoice = results[0];
      const maxCount = results[0]?.count || 0;
      const topChoices = results.filter(r => r.count === maxCount && r.count > 0);
      const hasTie = topChoices.length > 1;

      return (
        <div className="mt-6 bg-gradient-to-br from-black/40 to-black/20 rounded-xl p-6 border border-yellow-500/20">
          <h3 className={`text-2xl font-bold mb-4 text-${color}-400 flex items-center gap-2`}>
            <SparklesIcon size={24} />
            Winner Selection Wheel
          </h3>

          {topChoice && topChoice.count > 0 ? (
            <div>
              {hasTie && (
                <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                  <p className="text-yellow-400 text-sm font-semibold">
                    ⚠️ TIEBREAKER: {topChoices.length} {cat === 'actresses' ? 'actresses' : 'actors'} are tied with {maxCount} votes each!
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Tied: {topChoices.map(c => c.name).join(', ')}
                  </p>
                </div>
              )}

              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-lg border border-yellow-500/50">
                <div className="text-center">
                  <p className="text-sm text-gray-300">
                    {hasTie ? 'Spinning from tied voters:' : `Top ${cat === 'actresses' ? 'Actress' : 'Actor'}:`}
                  </p>
                  {!hasTie && (
                    <>
                      <p className={`text-2xl font-bold text-${color}-400`}>{topChoice.name}</p>
                      <p className="text-sm text-gray-400">{topChoice.count} votes from {topChoice.voters.length} voters</p>
                    </>
                  )}
                </div>

                <div className="mt-3">
                  <p className={`text-sm font-semibold text-${color}-400 mb-2`}>
                    {hasTie ? 'All Eligible' : ''} Voters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(hasTie ? topChoices.flatMap(c => c.voters) : topChoice.voters).map((voter, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm ${
                          winner[cat] === voter
                            ? 'bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-bold animate-pulse'
                            : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {voter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="w-64 h-64 mx-auto relative">
                  <div
                    className={`w-full h-full rounded-full border-8 border-${color}-500 relative bg-gradient-to-br from-purple-600 to-pink-600`}
                    style={{
                      transform: `rotate(${spinRotation[cat]}deg)`,
                      transition: isSpinning[cat] ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                    }}
                  >
                    {(hasTie ? topChoices.flatMap(c => c.voters) : topChoice.voters).map((voter, idx) => {
                      const totalVoters = hasTie ? topChoices.reduce((sum, c) => sum + c.voters.length, 0) : topChoice.voters.length;
                      const angle = (idx / totalVoters) * 360;
                      return (
                        <div
                          key={idx}
                          className="absolute top-1/2 left-1/2 origin-left"
                          style={{
                            transform: `rotate(${angle}deg) translateX(80px)`,
                            width: '2px',
                            height: '40px',
                            backgroundColor: 'rgba(255,255,255,0.3)'
                          }}
                        />
                      );
                    })}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SparklesIcon size={48} />
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                    <div className={`w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-${color}-400`} />
                  </div>
                </div>
              </div>

              {winner[cat] && (
                <div className="mb-4 p-6 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-xl text-center">
                  <TrophyIcon className="mx-auto mb-2" size={48} />
                  <p className="text-2xl font-bold">🎉 Winner: {winner[cat]} 🎉</p>
                </div>
              )}

              <button
                onClick={() => handleAdminAction({ type: 'spinWheel', category: cat })}
                disabled={isSpinning[cat]}
                className={`w-full px-6 py-4 bg-gradient-to-r from-${color}-500 to-pink-500 hover:from-${color}-600 hover:to-pink-600 rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSpinning[cat] ? 'Spinning...' : '🎰 Spin to Select Winner (Admin)'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No votes yet. Start voting to enable the wheel!</p>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <ChartIcon size={40} className="text-yellow-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                Live Results
              </h1>
              <ChartIcon size={40} className="text-blue-400" />
            </div>
            <div className="flex justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Actresses: {votes.actresses?.length || 0} votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Actors: {votes.actors?.length || 0} votes</span>
              </div>
            </div>
          </div>

          {/* Show eligibility message if user is eligible for tiebreaker */}
          {hasActiveTiebreaker && (isEligibleForActressesTiebreaker || isEligibleForActorsTiebreaker) && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-green-500 shadow-2xl text-center">
                <h3 className="text-2xl font-bold text-green-400 mb-3">🔥 You're Eligible for Tiebreaker!</h3>
                <p className="text-white">You voted for one of the tied choices. Scroll down to see the tiebreaker voting button in the relevant category section.</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Actresses */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/30">
              <h2 className="text-3xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
                <TrophyIcon size={32} />
                Best Actress
                <span className={`ml-auto text-sm px-3 py-1 rounded-full ${pollStatus.actressesOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {pollStatus.actressesOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                </span>
              </h2>

              {/* Tiebreaker Status */}
              {tiebreakers.actresses?.active && (
                <div className="mb-6 p-4 bg-orange-500/20 rounded-lg border-2 border-orange-500 animate-pulse">
                  <p className="text-orange-400 font-bold text-lg mb-2">🔥 TIEBREAKER ROUND {tiebreakers.actresses.round} ACTIVE!</p>
                  <p className="text-white mb-2">Tied: {tiebreakers.actresses.tiedChoices.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-3">
                    {tiebreakers.actresses.votes.length} / {tiebreakers.actresses.eligibleFingerprints?.length || 0} eligible voters have voted
                  </p>
                  <p className="text-xs text-yellow-300 mb-3">
                    ⚡ When all eligible voters vote, the system will automatically check and start a new round if still tied, or end the tiebreaker if resolved!
                  </p>
                  {isEligibleForActressesTiebreaker && (
                    <button
                      onClick={() => {
                        setCategory('actresses');
                        setView('tiebreaker');
                      }}
                      className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
                    >
                      {tiebreakers.actresses.votes.some(v => v.fingerprint === fingerprint) ? '✓ You Voted' : '→ Vote in Tiebreaker'}
                    </button>
                  )}
                </div>
              )}

              {/* Bubble Chart */}
              <div className="mb-6 h-64 relative bg-gradient-to-br from-yellow-500/10 to-pink-500/10 rounded-xl p-4 overflow-hidden">
                {actressResults.slice(0, 10).map((actress, idx) => {
                  // Better scaling: use square root for more dramatic size differences
                  const maxVotes = Math.max(...actressResults.map(a => a.count), 1);
                  const voteRatio = actress.count / maxVotes;
                  const size = actress.count === 0 ? 0 : minBubbleSize + (voteRatio * (maxBubbleSize - minBubbleSize));

                  const positions = [
                    { top: '10%', left: '15%' }, { top: '15%', left: '60%' }, { top: '35%', left: '30%' },
                    { top: '25%', left: '75%' }, { top: '55%', left: '10%' }, { top: '50%', left: '50%' },
                    { top: '60%', left: '80%' }, { top: '70%', left: '25%' }, { top: '75%', left: '65%' }, { top: '85%', left: '45%' }
                  ];
                  return (
                    <div
                      key={actress.name}
                      className="absolute rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center text-xs font-bold cursor-pointer shadow-lg"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: positions[idx]?.top,
                        left: positions[idx]?.left,
                        opacity: actress.count === 0 ? 0 : 0.9,
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 1s ease-out, height 1s ease-out, opacity 0.5s ease-out',
                        willChange: 'width, height, opacity'
                      }}
                      title={`${actress.name}: ${actress.count} votes`}
                    >
                      <span className="text-center px-2 transition-all duration-300">{actress.count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Full Rankings List with Scroll */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-yellow-400">Complete Rankings</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-800">
                  {actressResults.map((actress, idx) => (
                    <div key={actress.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
                      <span className={`text-xl font-bold ${idx < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>#{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">{actress.name}</span>
                          <span className="text-yellow-400">{actress.count} votes</span>
                        </div>
                        {actress.count > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${actress.percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spinning Wheel for Actresses */}
              {renderSpinningWheel('actresses', actressResults, 'yellow')}
            </div>

            {/* Actors */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500/30">
              <h2 className="text-3xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                <TrophyIcon size={32} />
                Best Actor
                <span className={`ml-auto text-sm px-3 py-1 rounded-full ${pollStatus.actorsOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {pollStatus.actorsOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                </span>
              </h2>

              {/* Tiebreaker Status */}
              {tiebreakers.actors?.active && (
                <div className="mb-6 p-4 bg-cyan-500/20 rounded-lg border-2 border-cyan-500 animate-pulse">
                  <p className="text-cyan-400 font-bold text-lg mb-2">🔥 TIEBREAKER ROUND {tiebreakers.actors.round} ACTIVE!</p>
                  <p className="text-white mb-2">Tied: {tiebreakers.actors.tiedChoices.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-3">
                    {tiebreakers.actors.votes.length} / {tiebreakers.actors.eligibleFingerprints?.length || 0} eligible voters have voted
                  </p>
                  <p className="text-xs text-cyan-300 mb-3">
                    ⚡ When all eligible voters vote, the system will automatically check and start a new round if still tied, or end the tiebreaker if resolved!
                  </p>
                  {isEligibleForActorsTiebreaker && (
                    <button
                      onClick={() => {
                        setCategory('actors');
                        setView('tiebreaker');
                      }}
                      className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
                    >
                      {tiebreakers.actors.votes.some(v => v.fingerprint === fingerprint) ? '✓ You Voted' : '→ Vote in Tiebreaker'}
                    </button>
                  )}
                </div>
              )}

              {/* Bubble Chart */}
              <div className="mb-6 h-64 relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 overflow-hidden">
                {actorResults.slice(0, 10).map((actor, idx) => {
                  // Better scaling: use vote ratio for more dramatic size differences
                  const maxVotes = Math.max(...actorResults.map(a => a.count), 1);
                  const voteRatio = actor.count / maxVotes;
                  const size = actor.count === 0 ? 0 : minBubbleSize + (voteRatio * (maxBubbleSize - minBubbleSize));

                  const positions = [
                    { top: '12%', left: '20%' }, { top: '18%', left: '65%' }, { top: '30%', left: '35%' },
                    { top: '28%', left: '78%' }, { top: '52%', left: '15%' }, { top: '48%', left: '55%' },
                    { top: '65%', left: '75%' }, { top: '72%', left: '28%' }, { top: '78%', left: '60%' }, { top: '82%', left: '42%' }
                  ];
                  return (
                    <div
                      key={actor.name}
                      className="absolute rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold cursor-pointer shadow-lg"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: positions[idx]?.top,
                        left: positions[idx]?.left,
                        opacity: actor.count === 0 ? 0 : 0.9,
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 1s ease-out, height 1s ease-out, opacity 0.5s ease-out',
                        willChange: 'width, height, opacity'
                      }}
                      title={`${actor.name}: ${actor.count} votes`}
                    >
                      <span className="text-center px-2 transition-all duration-300">{actor.count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Full Rankings List with Scroll */}
              <div>
                <h3 className="text-xl font-bold mb-3 text-blue-400">Complete Rankings</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
                  {actorResults.map((actor, idx) => (
                    <div key={actor.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
                      <span className={`text-xl font-bold ${idx < 3 ? 'text-blue-400' : 'text-gray-400'}`}>#{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">{actor.name}</span>
                          <span className="text-blue-400">{actor.count} votes</span>
                        </div>
                        {actor.count > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${actor.percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spinning Wheel for Actors */}
              {renderSpinningWheel('actors', actorResults, 'blue')}
            </div>
          </div>

          {/* Admin Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setView('home')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'togglePoll', category: 'actresses' })}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <LockIcon size={20} />
              {pollStatus.actressesOpen ? 'Close' : 'Open'} Actresses Poll
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'togglePoll', category: 'actors' })}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <LockIcon size={20} />
              {pollStatus.actorsOpen ? 'Close' : 'Open'} Actors Poll
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'startTiebreaker', category: 'actresses' })}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
              disabled={tiebreakers.actresses?.active}
            >
              {tiebreakers.actresses?.active ? '⏳ Actresses Tiebreaker Active' : '🔥 Start Actresses Tiebreaker'}
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'startTiebreaker', category: 'actors' })}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
              disabled={tiebreakers.actors?.active}
            >
              {tiebreakers.actors?.active ? '⏳ Actors Tiebreaker Active' : '🔥 Start Actors Tiebreaker'}
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'resolveTiebreaker', category: 'actresses' })}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              disabled={!tiebreakers.actresses?.active}
            >
              ✓ Resolve Actresses Tiebreaker
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'resolveTiebreaker', category: 'actors' })}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors"
              disabled={!tiebreakers.actors?.active}
            >
              ✓ Resolve Actors Tiebreaker
            </button>
            <button
              onClick={() => handleAdminAction({ type: 'reset' })}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              Reset All (Admin)
            </button>
          </div>
        </div>

        {showPinPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-2xl border-2 border-yellow-500 max-w-md w-full">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <LockIcon size={32} />
                Admin Authentication
              </h2>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyPinAndExecute()}
                placeholder="Enter PIN"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-yellow-500/50 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 mb-4"
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPinPrompt(false);
                    setPinInput('');
                    setPinAction(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPinAndExecute}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-lg font-semibold"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="text-yellow-400 animate-pulse"><StarIcon size={48} fill={true} /></div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Red Carpet Awards
            </h1>
            <div className="text-yellow-400 animate-pulse"><StarIcon size={48} fill={true} /></div>
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">Hollywood's Finest</p>
          <p className="text-xl text-gray-300">Vote for Best Actress & Best Actor</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => startVoting('actresses')}
            disabled={!pollStatus.actressesOpen || hasVoted.actresses}
            className={`p-8 rounded-2xl font-bold text-2xl shadow-2xl transition-all transform hover:scale-105 border-2 ${
              hasVoted.actresses
                ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-60'
                : !pollStatus.actressesOpen
                ? 'bg-red-900/50 border-red-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-yellow-500 to-pink-500 border-yellow-400 hover:from-yellow-600 hover:to-pink-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <StarIcon size={48} fill={true} />
              <span>Best Actress</span>
              {hasVoted.actresses && <span className="text-sm">✓ Already Voted</span>}
              {!pollStatus.actressesOpen && !hasVoted.actresses && <span className="text-sm">🔒 Poll Closed</span>}
            </div>
          </button>

          <button
            onClick={() => startVoting('actors')}
            disabled={!pollStatus.actorsOpen || hasVoted.actors}
            className={`p-8 rounded-2xl font-bold text-2xl shadow-2xl transition-all transform hover:scale-105 border-2 ${
              hasVoted.actors
                ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-60'
                : !pollStatus.actorsOpen
                ? 'bg-red-900/50 border-red-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-500 to-purple-500 border-blue-400 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <TrophyIcon size={48} />
              <span>Best Actor</span>
              {hasVoted.actors && <span className="text-sm">✓ Already Voted</span>}
              {!pollStatus.actorsOpen && !hasVoted.actors && <span className="text-sm">🔒 Poll Closed</span>}
            </div>
          </button>
        </div>

        <button
          onClick={() => setView('dashboard')}
          className="w-full px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold text-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 mb-6"
        >
          <ChartIcon size={32} />
          View Live Results Dashboard
        </button>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/30">
          <div className="grid md:grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                <UsersIcon size={24} />
                <span className="text-xl font-bold">Actresses</span>
              </div>
              <p className="text-3xl font-bold">{votes.actresses?.length || 0}</p>
              <p className="text-sm text-gray-400">votes cast</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                <UsersIcon size={24} />
                <span className="text-xl font-bold">Actors</span>
              </div>
              <p className="text-3xl font-bold">{votes.actors?.length || 0}</p>
              <p className="text-sm text-gray-400">votes cast</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>🌟 Scan the QR code to vote from your phone 🌟</p>
          <p className="mt-2">⚠️ Each device can vote once per category!</p>
        </div>
      </div>
    </div>
  );
}
