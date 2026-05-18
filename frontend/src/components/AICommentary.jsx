import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICommentary({ socket }) {
  const [comments, setComments] = useState([
    { id: 1, text: "Welcome to the Live Match! The AI engine is analyzing the game...", type: "insight" }
  ]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('ai_commentary', (comment) => {
      setComments((prev) => {
        const newComments = [comment, ...prev];
        return newComments.slice(0, 50); // Keep last 50 comments
      });
    });

    return () => {
      socket.off('ai_commentary');
    };
  }, [socket]);

  return (
    <div className="bg-surface rounded-lg p-4 h-64 flex flex-col border border-border">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-white uppercase tracking-wider">AI Insights</h3>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent z-10 pointer-events-none"></div>
        <div className="space-y-3 overflow-y-auto h-full pr-2 custom-scrollbar">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-3 rounded-lg border-l-4 text-sm bg-background border ${
                  comment.type === 'insight' ? 'border-l-primary text-gray-200' : 
                  comment.type === 'pressure' ? 'border-l-secondary text-gray-200' : 
                  'border-l-blue-400 text-gray-200'
                }`}
              >
                {comment.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
