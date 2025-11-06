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

export default function RedCarpetVoting() {
  const [view, setView] = useState('home');
  const [voterName, setVoterName] = useState('');
  const [selectedActresses, setSelectedActresses] = useState([]);
  const [votes, setVotes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [spinRotation, setSpinRotation] = useState(0);

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

      if (response.ok) {
        alert('Thank you for voting! 🌟');
        setVoterName('');
        setSelectedActresses([]);
        setView('home');
        loadVotes();
      }
    } catch (error) {
      alert('Failed to submit vote. Please try again.');
    }
  };

  const calculateResults = () => {
    const actressVotes = {};
    actresses.forEach(actress => {
      actressVotes[actress] = {
        count: 0,
        voters: []
      };
    });

    votes.forEach(vote => {
      vote.actresses.forEach(actress => {
        actressVotes[actress].count++;
        actressVotes[actress].voters.push(vote.name);
      });
    });

    return Object.entries(actressVotes)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  };

  const spinWheel = () => {
    const results = calculateResults();
    const topActress = results[0];
    
    if (!topActress || topActress.voters.length === 0) {
      alert('No votes yet!');
      return;
    }

    setIsSpinning(true);
    const spins = 5 + Math.random() * 3;
    const extraRotation = Math.random() * 360;
    const totalRotation = spins * 360 + extraRotation;
    
    setSpinRotation(totalRotation);

    setTimeout(() => {
      const randomWinner = topActress.voters[Math.floor(Math.random() * topActress.voters.length)];
      setWinner(randomWinner);
      setIsSpinning(false);
    }, 4000);
  };

  const resetPoll = async () => {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="text-yellow-400"><StarIcon size={32} fill={true} /></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                Red Carpet Awards
              </h1>
              <div className="text-yellow-400"><StarIcon size={32} fill={true} /></div>
            </div>
            <p className="text-xl text-gray-300">Cast Your Vote for the Best Actress</p>
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
                Select Your Top 5 Actresses ({selectedActresses.length}/5)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {actresses.map((actress) => {
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
    const topActress = results[0];

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

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/30">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Vote Distribution</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.filter(r => r.count > 0).map((actress, index) => {
                  const percentage = ((actress.count / totalVotes) * 100).toFixed(1);
                  return (
                    <div key={actress.name} className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold flex items-center gap-2">
                          {index === 0 && <AwardIcon size={20} />}
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
              
              {topActress && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-lg border border-yellow-500/50">
                  <div className="text-center mb-4">
                    <p className="text-lg text-gray-300">Top Actress:</p>
                    <p className="text-2xl font-bold text-yellow-400">{topActress.name}</p>
                    <p className="text-sm text-gray-400">{topActress.count} votes from {topActress.voters.length} voters</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-yellow-400 mb-2">Voters:</p>
                    <div className="flex flex-wrap gap-2">
                      {topActress.voters.map((voter, idx) => (
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
                    {topActress?.voters.map((voter, idx) => {
                      const angle = (idx / topActress.voters.length) * 360;
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
                onClick={spinWheel}
                disabled={isSpinning || !topActress}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpinning ? 'Spinning...' : '🎰 Spin to Select Winner'}
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
              Reset Poll
            </button>
          </div>
        </div>
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
          <p className="text-xl text-gray-300">Vote for Your Favorite Actress</p>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl space-y-6">
          <button
            onClick={() => setView('vote')}
            className="w-full px-8 py-6 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-xl font-bold text-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <StarIcon size={32} fill={true} />
            Cast Your Vote
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
          <p className="mt-2">Votes sync in real-time across all devices</p>
        </div>
      </div>
    </div>
  );
}