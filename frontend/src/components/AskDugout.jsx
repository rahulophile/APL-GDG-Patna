import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, Sparkles } from 'lucide-react';

export default function AskDugout() {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const targets = ['Captain', 'Coach', 'Bowling Coach', 'Commentator'];
  const [selectedTarget, setSelectedTarget] = useState('Captain');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(question.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setQuestion('');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-surface rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg text-white">Ask The Dugout</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <select 
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            {targets.map(t => <option key={t} value={t}>To: {t}</option>)}
          </select>
          
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about strategy, pressure, etc..."
              className="w-full bg-background border border-border rounded p-3 text-sm text-white focus:outline-none focus:border-primary min-h-[80px] resize-none"
            />
            <button 
              type="submit"
              disabled={!question.trim() || submitted}
              className="absolute bottom-2 right-2 p-2 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {submitted && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sent for moderation!
            </p>
          )}
        </form>
      </div>

      <div className="bg-surface rounded-lg p-4 border border-border flex-1 overflow-hidden flex flex-col">
        <h4 className="font-medium text-white mb-3 text-xs uppercase tracking-wider flex justify-between items-center">
          Trending
          <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30">LIVE</span>
        </h4>
        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
          <div className="bg-background p-3 rounded border border-border">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs text-primary font-medium">To: Captain</span>
              <button className="text-xs flex items-center gap-1 text-text-muted hover:text-white transition-colors">
                <ThumbsUp className="w-3 h-3" /> 12.4k
              </button>
            </div>
            <p className="text-sm text-gray-300">Why not bring in the spinner from the other end to exploit the rough?</p>
          </div>
          
          <div className="bg-background p-3 rounded border border-border">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs text-primary font-medium">To: Bowling Coach</span>
              <button className="text-xs flex items-center gap-1 text-text-muted hover:text-white transition-colors">
                <ThumbsUp className="w-3 h-3" /> 8.1k
              </button>
            </div>
            <p className="text-sm text-gray-300">Are we planning to use bouncers against the new batter?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
