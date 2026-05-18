import React, { useState, useEffect, useRef } from 'react';
import AICommentary from './AICommentary';
import ScoreCard from './ScoreCard';

export default function LiveMatchRoom({ socket }) {
  const [match, setMatch] = useState({
    runs: 0,
    wickets: 0,
    team1: 'IND',
    team2: 'AUS',
    overString: '0.0',
    crr: '0.0',
    req: '0.0',
    remainingRuns: 0,
    remainingBalls: 0,
    currentBatter: 'Virat K.',
    currentBowler: 'Pat C.'
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    socket.on('match_update', (data) => {
      setMatch(data);
    });

    return () => {
      socket.off('match_update');
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="w-full aspect-video bg-black flex flex-col items-center justify-center relative rounded-lg shadow-2xl overflow-hidden border border-border group">
        
        <iframe 
          className="w-full h-full" 
          src="https://www.youtube.com/embed/5ACv6Yp_rDo?autoplay=1&mute=1&controls=1&loop=1&playlist=5ACv6Yp_rDo&modestbranding=1&rel=0" 
          frameBorder="0" 
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        ></iframe>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard match={match} />
        <AICommentary socket={socket} />
      </div>
    </div>
  );
}
