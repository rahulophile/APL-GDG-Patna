import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Flame, Clock } from 'lucide-react';

export default function PredictionCard({ socket }) {
  const [windowStatus, setWindowStatus] = useState('closed'); // 'closed', 'open'
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // The actual ball result
  
  const options = ['Dot Ball', 'Single/Double', 'Boundary (4/6)', 'Wicket!'];

  useEffect(() => {
    if (!socket) return;

    socket.on('prediction_window', (data) => {
      if (data.status === 'open') {
        setWindowStatus('open');
        setTimeLeft(data.time);
        setSelected(null);
        setResult(null);
        
        // Start countdown
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) clearInterval(timer);
            return prev - 1;
          });
        }, 1000);
      } else {
        setWindowStatus('closed');
      }
    });

    socket.on('ball_result', (outcome) => {
      // Map outcome to option category for feedback
      let category = 'Dot Ball';
      if (['1', '2'].includes(outcome.label)) category = 'Single/Double';
      else if (['4', '6'].includes(outcome.label)) category = 'Boundary (4/6)';
      else if (outcome.label === 'W') category = 'Wicket!';
      
      setResult(category);
    });

    return () => {
      socket.off('prediction_window');
      socket.off('ball_result');
    };
  }, [socket]);

  const handlePredict = (opt) => {
    if (windowStatus === 'open') {
      setSelected(opt);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-surface rounded-lg p-4 border border-border flex-1 flex flex-col justify-center relative">
        
        {windowStatus === 'open' && (
          <div className="absolute top-2 right-4 flex items-center gap-1 text-red-500 font-bold text-xs animate-pulse">
            <Clock className="w-3 h-3" /> {timeLeft}s Left
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Next Ball Prediction
          </h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            +50 pts
          </span>
        </div>

        {windowStatus === 'closed' && !selected && !result && (
          <div className="text-center text-text-muted py-6">
            <p>Wait for the bowler to start the run-up...</p>
          </div>
        )}

        {windowStatus === 'open' && !selected && (
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handlePredict(opt)}
                className="bg-background border border-border hover:border-primary hover:bg-surface-hover transition-all p-4 rounded text-sm font-medium text-left flex justify-between items-center group"
              >
                {opt}
                <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
              </button>
            ))}
          </div>
        )}

        {selected && !result && (
          <div className="text-center py-8 bg-background rounded border border-border relative overflow-hidden">
            <Flame className="w-8 h-8 text-primary mx-auto mb-3 animate-soft-pulse" />
            <p className="text-white font-medium">Prediction Locked: <span className="text-primary">{selected}</span></p>
            <p className="text-xs text-text-muted mt-2">Waiting for result...</p>
          </div>
        )}

        {result && (
          <div className={`text-center py-8 rounded border relative overflow-hidden ${selected === result ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className="text-white font-medium mb-1">Result: <span className="font-bold">{result}</span></p>
            {selected === result ? (
              <p className="text-green-500 font-bold flex justify-center items-center gap-1">
                <CheckCircle className="w-4 h-4" /> You won +50 pts!
              </p>
            ) : (
              <p className="text-red-500 text-sm">
                You chose {selected || 'nothing'}. Better luck next time!
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h4 className="font-medium text-white mb-4 text-xs uppercase tracking-wider">Live Leaderboard</h4>
        <div className="space-y-3">
          {['RahulR (1250)', 'CricketFan99 (1120)', 'Kohli_Fan (980)'].map((user, i) => (
            <div key={user} className="flex justify-between items-center text-sm border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${i === 0 ? 'bg-[#ffd700] text-black' : 'bg-background text-text-muted border border-border'}`}>
                  {i + 1}
                </span>
                <span className="text-gray-300 font-medium">{user.split(' ')[0]}</span>
              </div>
              <span className="text-primary font-mono text-xs">{user.split(' ')[1].replace(/[()]/g, '')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
