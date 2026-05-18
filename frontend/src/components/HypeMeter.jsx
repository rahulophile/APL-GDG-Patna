import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export default function HypeMeter({ socket }) {
  const [data, setData] = useState(Array(20).fill({ hype: 30 }));
  const [currentHype, setCurrentHype] = useState(30);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('hype_update', (dataPayload) => {
      const hype = dataPayload.value;
      setCurrentHype(hype);
      setData(prev => {
        const newData = [...prev.slice(1), { hype }];
        return newData;
      });
    });

    // Gradual decay if no updates
    const interval = setInterval(() => {
      setCurrentHype(prev => {
        if (prev <= 10) return prev;
        const newHype = prev > 50 ? prev - 5 : prev - 2;
        setData(d => [...d.slice(1), { hype: newHype }]);
        return newHype;
      });
    }, 3000);

    return () => {
      socket.off('hype_update');
      clearInterval(interval);
    };
  }, [socket]);

  return (
    <div className="bg-surface rounded-lg p-4 h-64 flex flex-col relative overflow-hidden group border border-border">
      
      <div className="flex justify-between items-center mb-2 z-10">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${currentHype > 70 ? 'text-primary animate-pulse' : 'text-text-muted'}`} />
          <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Hype Meter</h3>
        </div>
        <div className="text-xl font-bold font-mono">
          <span className={currentHype > 70 ? 'text-primary' : 'text-white'}>
            {currentHype}
          </span>
          <span className="text-sm text-text-muted">/100</span>
        </div>
      </div>
      
      <div className="flex-1 -mx-4 -mb-4 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHype" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f80e0" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#1f80e0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#192133', border: '1px solid #2c364c', borderRadius: '4px' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Area 
              type="monotone" 
              dataKey="hype" 
              stroke="#1f80e0" 
              fillOpacity={1} 
              fill="url(#colorHype)" 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
