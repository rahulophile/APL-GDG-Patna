import React from 'react';

export default function ScoreCard({ match }) {
  // Mock data to simulate detailed scorecard based on match state
  const batter1 = { name: match.currentBatter, runs: Math.floor(match.runs * 0.4), balls: Math.floor(match.balls * 0.4) };
  const batter2 = { name: match.team1 === 'IND' ? 'Rohit S.' : 'Steve S.', runs: Math.floor(match.runs * 0.3), balls: Math.floor(match.balls * 0.3) };
  
  const bowler = { name: match.currentBowler, overs: Math.floor(match.balls % 6 === 0 ? 3 : 2), balls: match.balls % 6, runs: 18, wickets: 1 };

  return (
    <div className="bg-surface rounded-lg h-64 flex flex-col border border-border overflow-hidden">
      {/* Match Header Section */}
      <div className="bg-background/50 p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1f80e0] flex items-center justify-center font-bold text-white text-xs">
            {match.team1}
          </div>
          <div>
            <div className="text-xl font-bold text-white leading-tight">
              {match.runs}<span className="text-sm text-gray-400 font-normal">/{match.wickets}</span>
            </div>
            <div className="text-xs text-text-muted">{match.overString} Overs</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-semibold text-gray-300">CRR: {match.crr}</div>
          <div className="text-[10px] text-text-muted">REQ: {match.req}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-text-muted">Target</div>
            <div className="text-sm font-bold text-white">{match.target}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#03c66b] flex items-center justify-center font-bold text-white text-xs">
            {match.team2}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-2 p-3">
        {/* Batting */}
        <div className="space-y-1">
          <div className="flex text-[10px] uppercase text-text-muted font-medium mb-1 px-1">
            <div className="flex-1">Batter</div>
            <div className="w-8 text-right">R</div>
            <div className="w-8 text-right">B</div>
            <div className="w-10 text-right">SR</div>
          </div>
          
          <div className="flex text-sm text-white items-center bg-background p-1.5 rounded border border-border">
            <div className="flex-1 font-semibold text-primary truncate">{batter1.name} *</div>
            <div className="w-8 text-right font-mono text-xs">{batter1.runs}</div>
            <div className="w-8 text-right font-mono text-xs text-text-muted">{batter1.balls}</div>
            <div className="w-10 text-right font-mono text-xs">{(batter1.runs / (batter1.balls || 1) * 100).toFixed(0)}</div>
          </div>
          
          <div className="flex text-sm text-gray-300 items-center px-1.5">
            <div className="flex-1 truncate">{batter2.name}</div>
            <div className="w-8 text-right font-mono text-xs">{batter2.runs}</div>
            <div className="w-8 text-right font-mono text-xs text-text-muted">{batter2.balls}</div>
            <div className="w-10 text-right font-mono text-xs">{(batter2.runs / (batter2.balls || 1) * 100).toFixed(0)}</div>
          </div>
        </div>

        {/* Bowling */}
        <div className="mt-auto">
          <div className="flex text-[10px] uppercase text-text-muted font-medium mb-1 border-t border-border pt-1.5 px-1">
            <div className="flex-1">Bowler</div>
            <div className="w-8 text-right">O</div>
            <div className="w-8 text-right">R</div>
            <div className="w-8 text-right">W</div>
            <div className="w-10 text-right">ECO</div>
          </div>
          
          <div className="flex text-sm text-white items-center px-1.5">
            <div className="flex-1 font-semibold text-primary truncate">{bowler.name} *</div>
            <div className="w-8 text-right font-mono text-xs">{bowler.overs}.{bowler.balls}</div>
            <div className="w-8 text-right font-mono text-xs">{bowler.runs}</div>
            <div className="w-8 text-right font-mono text-xs text-secondary font-bold">{bowler.wickets}</div>
            <div className="w-10 text-right font-mono text-xs">{(bowler.runs / (bowler.overs || 1)).toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
