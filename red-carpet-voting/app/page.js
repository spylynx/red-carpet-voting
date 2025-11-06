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

const ADMIN_PIN = "2025"; // Change this to your desired PIN

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

const UsersIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const LockIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function RedCarpetVoting() {
  const [view, setView] = useState('home');
  const [voterName, setVoterName] = useState('');
  const [selectedActresses, setSelectedActresses] = useState([]);
  const [votes, setVotes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [spinRotation, setSpinRotation] = useState(0);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isRunoff, setIsRunoff] = useState(false);
  const [runoffActresses, setRunoffActresses] = useState([]);

  useEffect(() => {
    loadVotes();
    const interval = setInterval(loadVotes, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadVotes = async () => {
    try {
      const response = await fetch('/api/votes');
      const data = await response.json();
      setVotes(data.votes || []);
      setIsRunoff(data.isRunoff || false);
      setRunoffActresses(data.runoffActresses || []);
    } catch (error) {
      console.error('Failed to load votes:', error);
    }
  };

  const toggleActress = (actress) => {
    if (selectedActresses.includes(actress)) {
      setSelectedActresses(selectedActresses.filter(a => a !== actress));
    } else if (selectedActresses.length < 5) {
      setSelectedActresses([...selectedActresses, actress]);
    }
  };

  const submitVote = async () => {
    if (!voterName.trim() || selectedActresses.length === 0) {
      alert('Please enter your name and select at least one actress!');
      return;
    }

    // Check if name already voted
    const existingVote = votes.find(v => v.name.toLowerCase() === voterName.trim().toLowerCase());
    if (existingVote) {
      alert('This name has already voted! Each person can only vote once. Please use a different name.');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: voterName.trim(),
          actresses: selectedActresses,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Thank you for voting! 🌟');
        setVoterName('');
        setSelectedActresses([]);
        setView('home');
        loadVotes();
      } else {
        alert(data.error || 'Failed to submit vote');
      }
    } catch (error) {
      alert('Failed to submit vote. Please try again.');
    }
  };

  const calculateResults = () => {
    const actressVotes = {};
    const actressList = isRunoff && runoffActresses.length > 0 ? runoffActresses : actresses;
    
    actressList.forEach(actress => {
      actressVotes[actress] = {
        count: 0,
        voters: []
      };
    });

    votes.forEach(vote => {
      vote.actresses.forEach(actress => {
        if (actressVotes[actress]) {
          actressVotes[actress].count++;
          actressVotes[actress].voters.push(vote.name);
        }
      });
    });

    return Object.entries(actressVotes)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  };

  const getTopActresses = () => {
    const results = calculateResults();
    if (results.length === 0 || results[0].count === 0) return [];
    
    const topVoteCount = results[0].count;
    return results.filter(r => r.count === topVoteCount);
  };

  const checkForTies = () => {
    const results = calculateResults();
    if (results.length < 3) return null;
    
    // Get top 3 unique vote counts
    const voteCounts = [...new Set(results.map(r => r.count))].sort((a, b) => b - a).slice(0, 3);
    
    // Find all actresses in top 3 positions
    const top3 = results.filter(r => voteCounts.includes(r.count) && r.count > 0);
    
    // Check if there are ties (more than 3 actresses in top 3)
    if (top3.length > 3) {
      return top3.map(a => a.name);
    }
    
    return null;
  };

  const startRunoff = async () => {
    const tiedActresses = checkForTies();
    if (!tiedActresses) {
      alert('No ties detected in top 3!');
      return;
    }

    if (!confirm(`Start a runoff vote for these ${tiedActresses.length} tied actresses: ${tiedActresses.join(', ')}?`)) {
      return;
    }

    try {
      await fetch('/api/votes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'startRunoff',
          actresses: tiedActresses
        }),
      });
      
      alert('Runoff voting started! All previous votes have been cleared.');
      loadVotes();
      setView('home');
    } catch (error) {
      alert('Failed to start runoff.');
    }
  };

  const handleSpinClick = () => {
    setShowPinPrompt(true);
  };

  const verifyPinAndSpin = () => {
    if (pinInput === ADMIN_PIN) {
      setShowPinPrompt(false);
      setPinInput('');
      spinWheel();
    } else {
      alert('Incorrect PIN! Only the host can spin the wheel.');
      setPinInput('');
    }
  };

  const spinWheel = () => {
    const topActresses = getTopActresses();
    
    if (topActresses.length === 0) {
      alert('No votes yet!');
      return;
    }

    // Combine all voters from all tied top actresses
    const allVoters = topActresses.flatMap(a => a.voters);
    
    if (allVoters.length === 0) {
      alert('No voters to select from!');
      return;
    }

    setIsSpinning(true);
    const spins = 5 + Math.random() * 3;
    const extraRotation = Math.random() * 360;
    const totalRotation = spins * 360 + extraRotation;
    
    setSpinRotation(totalRotation);

    setTimeout(() => {
      const randomWinner = allVoters[Math.floor(Math.random() * allVoters.length)];
      setWinner(randomWinner);
      setIsSpinning(false);
    }, 4000);
  };

  const resetPoll = async () => {
    const pin = prompt('Enter admin PIN to reset poll:');
    if (pin !== ADMIN_PIN) {
      alert('Incorrect PIN!');
      return;
    }

    if (confirm('Are you sure you want to reset all votes? This cannot be undone.')) {
      try {
        await fetch('/api/votes', { method: 'DELETE' });
        setWinner(null);
        setSpinRotation(0);
        setView('home');
        loadVotes();
      } catch (error) {
        alert('Failed to reset votes.');
      }
    }
  };

  if (view === 'vote') {
    const actressList = isRunoff && runoffActresses.length > 0 ? runoffActresses : actresses;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="text-yellow-400"><StarIcon size={32} fill={true} /></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                {isRunoff ? 'Runoff Vote' : 'Red Carpet Awards'}
              </h1>
              <div className="text-yellow-400"><StarIcon size={32} fill={true} /></div>
            </div>
            <p className="text-xl text-gray-300">
              {isRunoff ? 'Vote Again - Top Tied Actresses Only!' : 'Cast Your Vote for the Best Actress'}
            </p>
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
              <p className="text-sm text-gray-400 mt-2">⚠️ You can only vote once - use your real name!</p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3 text-yellow-400">
                Select Your Top 5 Actresses ({selectedActresses.length}/5)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {actressList.map((actress) => {
                  const isSelected = selectedActresses.includes(actress);
                  const isFull = selectedActresses.length >= 5 && !isSelected;
                  
                  return (
                    <button
                      key={actress}
                      onClick={() => toggleActress(actress)}
                      disabled={isFull}
                      className={`p-4 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-yellow-500 to-pink-500 text-white shadow-lg scale-105'
                          : isFull
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-yellow-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{actress}</span>
                        {isSelected && <StarIcon size={20} fill={true} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setView('home')}
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

  if (view === 'results') {
    const results = calculateResults();
    const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
    const topActresses = getTopActresses();
    const tiedActresses = checkForTies();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="text-yellow-400"><TrophyIcon size={40} /></div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                Results
              </h1>
              <div className="text-yellow-400"><TrophyIcon size={40} /></div>
            </div>
            <p className="text-xl text-gray-300">Total Votes Cast: {votes.length}</p>
          </div>

          {tiedActresses && (
            <div className="mb-6 p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl text-center">
              <p className="text-xl font-bold text-yellow-400 mb-2">⚠️ Tie Detected in Top 3!</p>
              <p className="text-gray-300 mb-3">{tiedActresses.length} actresses are tied</p>
              <button
                onClick={startRunoff}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
              >
                Start Runoff Vote
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/30">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Vote Distribution</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.filter(r => r.count > 0).map((actress, index) => {
                  const percentage = ((actress.count / totalVotes) * 100).toFixed(1);
                  const isTopActress = topActresses.some(t => t.name === actress.name);
                  return (
                    <div key={actress.name} className={`rounded-lg p-4 ${isTopActress ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-white/10'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold flex items-center gap-2">
                          {isTopActress && <AwardIcon size={20} />}
                          {actress.name}
                        </span>
                        <span className="text-yellow-400 font-bold">{actress.count} votes</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/30">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                <SparklesIcon size={24} />
                Winner Selection
              </h2>
              
              {topActresses.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-lg border border-yellow-500/50">
                  <div className="text-center mb-4">
                    <p className="text-lg text-gray-300">Top {topActresses.length > 1 ? `${topActresses.length} Tied ` : ''}Actress{topActresses.length > 1 ? 'es' : ''}:</p>
                    {topActresses.map((actress, idx) => (
                      <p key={idx} className="text-2xl font-bold text-yellow-400">{actress.name}</p>
                    ))}
                    <p className="text-sm text-gray-400 mt-2">
                      Total: {topActresses.reduce((sum, a) => sum + a.count, 0)} votes from {topActresses.reduce((sum, a) => sum + a.voters.length, 0)} voters
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-yellow-400 mb-2">All Eligible Voters:</p>
                    <div className="flex flex-wrap gap-2">
                      {topActresses.flatMap(actress => actress.voters).map((voter, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm ${
                            winner === voter
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
              )}

              <div className="relative mb-6">
                <div className="w-64 h-64 mx-auto relative">
                  <div
                    className="w-full h-full rounded-full border-8 border-yellow-500 relative bg-gradient-to-br from-purple-600 to-pink-600"
                    style={{
                      transform: `rotate(${spinRotation}deg)`,
                      transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                    }}
                  >
                    {topActresses.length > 0 && topActresses.flatMap(a => a.voters).map((voter, idx, allVoters) => {
                      const angle = (idx / allVoters.length) * 360;
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
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-400" />
                  </div>
                </div>
              </div>

              {winner && (
                <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-xl text-center">
                  <TrophyIcon className="mx-auto mb-2" size={48} />
                  <p className="text-2xl font-bold">🎉 Winner: {winner} 🎉</p>
                </div>
              )}

              <button
                onClick={handleSpinClick}
                disabled={isSpinning || topActresses.length === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LockIcon size={24} />
                {isSpinning ? 'Spinning...' : '🎰 Spin to Select Winner (Host Only)'}
              </button>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setView('home')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={resetPoll}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              Reset Poll (Admin)
            </button>
          </div>
        </div>

        {showPinPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-red-900 p-8 rounded-2xl border-2 border-yellow-500 max-w-md w-full">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <LockIcon size={32} />
                Admin Authentication
              </h2>
              <p className="text-gray-300 mb-4">Enter the PIN to spin the wheel:</p>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyPinAndSpin()}
                placeholder="Enter PIN"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-yellow-500/50 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 mb-4"
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPinPrompt(false);
                    setPinInput('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPinAndSpin}
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
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="text-yellow-400 animate-pulse"><StarIcon size={48} fill={true} /></div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Red Carpet
            </h1>
            <div className="text-yellow-400 animate-pulse"><StarIcon size={48} fill={true} /></div>
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">Awards Party</p>
          <p className="text-xl text-gray-300">
            {isRunoff ? '🔥 RUNOFF VOTING IN PROGRESS 🔥' : 'Vote for Your Favorite Actress'}
          </p>
          {isRunoff && (
            <p className="text-lg text-yellow-400 mt-2">Only voting for: {runoffActresses.join(', ')}</p>
          )}
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl space-y-6">
          <button
            onClick={() => setView('vote')}
            className="w-full px-8 py-6 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-xl font-bold text-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <StarIcon size={32} fill={true} />
            {isRunoff ? 'Cast Your Runoff Vote' : 'Cast Your Vote'}
            <StarIcon size={32} fill={true} />
          </button>

          <button
            onClick={() => setView('results')}
            className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-bold text-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <TrophyIcon size={32} />
            View Results & Pick Winner
          </button>

          <div className="text-center pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <UsersIcon size={20} />
              <span className="text-lg">{votes.length} votes cast so far</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>🌟 Scan the QR code to vote from your phone 🌟</p>
          <p className="mt-2">⚠️ Each person can only vote once!</p>
          <p className="mt-2">Votes sync in real-time across all devices</p>
        </div>
      </div>
    </div>
  );
}
