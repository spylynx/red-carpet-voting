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

  useEffect(() => {
    const fp = getBrowserFingerprint();
    setFingerprint(fp);
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
        alert('Thank you for voting! 🌟');
        setVoterName('');
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
    } else if (pinAction?.type === 'reset') {
      if (confirm('Reset ALL votes? This cannot be undone!')) {
        try {
          await fetch('/api/votes', { method: 'DELETE' });
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

  if (view === 'dashboard') {
    const actressResults = calculateResults('actresses');
    const actorResults = calculateResults('actors');
    const maxBubbleSize = 120;
    
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
              
              {/* Bubble Chart */}
              <div className="mb-6 h-64 relative bg-gradient-to-br from-yellow-500/10 to-pink-500/10 rounded-xl p-4 overflow-hidden">
                {actressResults.slice(0, 10).map((actress, idx) => {
                  const size = Math.max(40, (actress.percentage / 100) * maxBubbleSize);
                  const positions = [
                    { top: '10%', left: '15%' }, { top: '15%', left: '60%' }, { top: '35%', left: '30%' },
                    { top: '25%', left: '75%' }, { top: '55%', left: '10%' }, { top: '50%', left: '50%' },
                    { top: '60%', left: '80%' }, { top: '70%', left: '25%' }, { top: '75%', left: '65%' }, { top: '85%', left: '45%' }
                  ];
                  return (
                    <div
                      key={actress.name}
                      className="absolute rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center text-xs font-bold transition-all duration-1000 hover:scale-110 cursor-pointer"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: positions[idx]?.top,
                        left: positions[idx]?.left,
                        opacity: 0.9
                      }}
                      title={`${actress.name}: ${actress.count} votes`}
                    >
                      <span className="text-center px-2">{actress.count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Top 5 List */}
              <div className="space-y-2">
                {actressResults.slice(0, 5).map((actress, idx) => (
                  <div key={actress.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
                    <span className="text-2xl font-bold text-yellow-400">#{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{actress.name}</span>
                        <span className="text-yellow-400">{actress.count} votes</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${actress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              
              {/* Bubble Chart */}
              <div className="mb-6 h-64 relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 overflow-hidden">
                {actorResults.slice(0, 10).map((actor, idx) => {
                  const size = Math.max(40, (actor.percentage / 100) * maxBubbleSize);
                  const positions = [
                    { top: '12%', left: '20%' }, { top: '18%', left: '65%' }, { top: '30%', left: '35%' },
                    { top: '28%', left: '78%' }, { top: '52%', left: '15%' }, { top: '48%', left: '55%' },
                    { top: '65%', left: '75%' }, { top: '72%', left: '28%' }, { top: '78%', left: '60%' }, { top: '82%', left: '42%' }
                  ];
                  return (
                    <div
                      key={actor.name}
                      className="absolute rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold transition-all duration-1000 hover:scale-110 cursor-pointer"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: positions[idx]?.top,
                        left: positions[idx]?.left,
                        opacity: 0.9
                      }}
                      title={`${actor.name}: ${actor.count} votes`}
                    >
                      <span className="text-center px-2">{actor.count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Top 5 List */}
              <div className="space-y-2">
                {actorResults.slice(0, 5).map((actor, idx) => (
                  <div key={actor.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
                    <span className="text-2xl font-bold text-blue-400">#{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{actor.name}</span>
                        <span className="text-blue-400">{actor.count} votes</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${actor.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
