import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LiveMatchRoom from './components/LiveMatchRoom';
import PredictionCard from './components/PredictionCard';
import AskDugout from './components/AskDugout';
import RandomFanConnect from './components/RandomFanConnect';
import CrowdNoise from './components/CrowdNoise';
import { Flame, Trophy, Mic2, MessageSquare, Activity, Users, User, ChevronRight } from 'lucide-react';

const SOCKET_URL = import.meta.env.PROD ? '/' : 'http://localhost:5001';
const socket = io(SOCKET_URL);

function App() {
  const [activeTab, setActiveTab] = useState('connect');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (isJoined && userName) {
      socket.emit('set_user', userName);
    }
  }, [isJoined, userName]);

  const handleTabClick = (tab) => {
    if (!isJoined) {
      setShowLogin(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setIsJoined(true);
      setShowLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative font-sans">
      {/* Login Modal Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowLogin(false)}></div>
          <div className="bg-surface rounded-xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-border">
            <h2 className="text-xl font-bold text-white mb-2">Login or Sign Up</h2>
            <p className="text-text-muted mb-6 text-sm">Enter your name to unlock interactive features.</p>
            
            <form onSubmit={handleLoginSubmit}>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-background border border-border rounded p-3 text-white mb-4 focus:outline-none focus:border-primary transition-colors text-sm"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full py-3 bg-primary text-white font-semibold rounded hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
              >
                Continue <ChevronRight className="w-4 h-4 inline" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header (Hotstar style) */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-400 rounded flex items-center justify-center font-bold text-white tracking-tighter">FP</div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                FanPulse
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
              <a href="#" className="text-white hover:text-white transition-colors">Sports</a>
              <a href="#" className="hover:text-white transition-colors">Movies</a>
              <a href="#" className="hover:text-white transition-colors">TV</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-surface px-3 py-1.5 rounded text-xs font-semibold text-white border border-border">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-soft-pulse"></span>
              LIVE MATCH
            </div>
            
            {!isJoined ? (
              <button 
                onClick={() => setShowLogin(true)}
                className="text-sm font-semibold text-white hover:text-primary transition-colors flex items-center gap-2"
              >
                <User className="w-5 h-5" /> Login
              </button>
            ) : (
              <div className="text-sm font-medium text-primary flex items-center gap-2">
                <User className="w-5 h-5" /> {userName}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left/Main Column - Video Player & Main Stats */}
        <div className="w-full lg:w-[65%] xl:w-[70%] space-y-6">
          <LiveMatchRoom socket={socket} />
        </div>
        
        {/* Right Sidebar - Interactive Features */}
        <div className="w-full lg:w-[35%] xl:w-[30%] flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white hidden lg:block">Fan Features</h3>
          
          {/* Minimal Tabs */}
          <div className="flex gap-2 border-b border-border overflow-x-auto custom-scrollbar pb-1">
            <button 
              onClick={() => handleTabClick('connect')}
              className={`pb-2 px-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'connect' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              Talk to Fans
              {activeTab === 'connect' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t"></span>}
            </button>
            <button 
              onClick={() => handleTabClick('predictions')}
              className={`pb-2 px-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'predictions' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              Predict
              {activeTab === 'predictions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t"></span>}
            </button>
            <button 
              onClick={() => handleTabClick('dugout')}
              className={`pb-2 px-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'dugout' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              Ask Dugout
              {activeTab === 'dugout' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t"></span>}
            </button>
            <button 
              onClick={() => handleTabClick('crowd')}
              className={`pb-2 px-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'crowd' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              Noise Map
              {activeTab === 'crowd' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t"></span>}
            </button>
          </div>
          
          <div className="flex-1 bg-surface rounded-xl border border-border p-4 min-h-[500px] flex flex-col">
            {!activeTab ? (
              <div className="text-center text-text-muted my-auto">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold text-white mb-2">Engage with the Match</h3>
                <p className="text-sm px-4">Select a tab above to talk to random fans, make predictions, or share your excitement!</p>
                {!isJoined && (
                  <button onClick={() => setShowLogin(true)} className="mt-6 px-6 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-hover">
                    Login to Start
                  </button>
                )}
              </div>
            ) : (
              <div className="h-full w-full">
                {activeTab === 'connect' && <RandomFanConnect socket={socket} isJoined={isJoined} onRequireLogin={() => setShowLogin(true)} />}
                {activeTab === 'predictions' && <PredictionCard socket={socket} isJoined={isJoined} onRequireLogin={() => setShowLogin(true)} />}
                {activeTab === 'dugout' && <AskDugout isJoined={isJoined} onRequireLogin={() => setShowLogin(true)} />}
                {activeTab === 'crowd' && <CrowdNoise isJoined={isJoined} onRequireLogin={() => setShowLogin(true)} />}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
