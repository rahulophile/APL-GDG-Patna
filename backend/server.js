const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 5001;

let waitingUsers = []; // queue of socket IDs
const activeMatches = new Map(); // socket.id -> partner socket.id
const users = new Map(); // socket.id -> { name }

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('set_user', (name) => {
    users.set(socket.id, { name });
  });

  // -----------------------------------------------------
  // 24/7 MOCK MATCH ENGINE
  // -----------------------------------------------------
  // We simulate a match that bowls a ball every 15 seconds.
  
  let matchState = {
    runs: 142,
    wickets: 4,
    balls: 93, // 15.3 overs
    team1: 'IND',
    team2: 'AUS',
    target: 210,
    currentBatter: 'Virat K.',
    currentBowler: 'Pat C.'
  };

  const ballOutcomes = [
    { type: 'dot', label: '0', hype: 10 },
    { type: 'single', label: '1', hype: 20 },
    { type: 'double', label: '2', hype: 30 },
    { type: 'four', label: '4', hype: 70 },
    { type: 'six', label: '6', hype: 100 },
    { type: 'wicket', label: 'W', hype: 95 }
  ];

  let predictionPhase = false;

  const broadcastMatchState = () => {
    const overs = Math.floor(matchState.balls / 6);
    const balls = matchState.balls % 6;
    const overString = `${overs}.${balls}`;
    const crr = (matchState.runs / (matchState.balls / 6)).toFixed(1);
    
    const remainingRuns = matchState.target - matchState.runs;
    const remainingBalls = 120 - matchState.balls;
    const req = (remainingRuns / (remainingBalls / 6)).toFixed(1);

    io.emit('match_update', {
      ...matchState,
      overString,
      crr,
      req,
      remainingRuns,
      remainingBalls
    });
  };

  // Run the match loop only once for all clients
  if (!global.matchEngineStarted) {
    global.matchEngineStarted = true;
    
    setInterval(() => {
      // 1. Open Prediction Window (lasts 8 seconds)
      predictionPhase = true;
      io.emit('prediction_window', { status: 'open', time: 8 });
      
      setTimeout(() => {
        // 2. Close Prediction Window
        predictionPhase = false;
        io.emit('prediction_window', { status: 'closed' });

        // 3. Bowl the ball 2 seconds later
        setTimeout(() => {
          const outcome = ballOutcomes[Math.floor(Math.random() * ballOutcomes.length)];
          
          // Update match state
          matchState.balls += 1;
          if (outcome.label === 'W') {
            matchState.wickets += 1;
          } else {
            matchState.runs += parseInt(outcome.label);
          }

          // Reset innings if all out or 20 overs done
          if (matchState.wickets >= 10 || matchState.balls >= 120) {
            matchState = {
              runs: 0,
              wickets: 0,
              balls: 0,
              team1: matchState.team1 === 'IND' ? 'AUS' : 'IND',
              team2: matchState.team2 === 'AUS' ? 'IND' : 'AUS',
              target: matchState.runs + 1,
              currentBatter: 'New Batter',
              currentBowler: 'New Bowler'
            };
          }

          io.emit('ball_result', outcome);
          broadcastMatchState();
          
          // Smart AI Commentary (Data-based Gemini Integration)
          const generateCommentary = async () => {
            try {
              if (process.env.GEMINI_API_KEY) {
                const { GoogleGenAI } = require('@google/genai');
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                
                const prompt = `You are a hype cricket commentator. The current score is ${matchState.runs}/${matchState.wickets}. The batter ${matchState.currentBatter} just scored a ${outcome.label === 'W' ? 'Wicket' : outcome.label}. Generate a short 1-sentence energetic commentary.`;
                
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });
                
                io.emit('ai_commentary', { id: Date.now(), text: `[Vision AI] ${response.text.trim()}`, type: outcome.label === 'W' ? 'pressure' : 'insight' });
              } else {
                // Fallback if no API key
                let commentText = outcome.label === '6' ? "Massive hit! It's out of the park." : 
                                  outcome.label === '4' ? "Pierced the gap brilliantly for a boundary." : 
                                  outcome.label === 'W' ? "Got him! Huge breakthrough." : "Sensible play.";
                io.emit('ai_commentary', { id: Date.now(), text: `[AI] ${commentText}`, type: outcome.label === 'W' ? 'pressure' : 'insight' });
              }
            } catch (err) {
              console.error("Gemini Error:", err.message);
            }
          };
          
          generateCommentary();
          io.emit('hype_update', { value: outcome.hype });

        }, 2000);
      }, 8000);

    }, 15000);
  }

  // Send current state to newly connected client immediately
  broadcastMatchState();

  // -----------------------------------------------------
  // AI VISION PIPELINE (Google Gemini Integration)
  // -----------------------------------------------------
  socket.on('analyze_video_frame', async (data) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.log("No Gemini API key found, skipping vision analysis.");
        return;
      }
      
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          "You are an expert cricket commentator and live analyst.",
          "Look at this frame from a live cricket match video.",
          "1. Briefly describe what is happening visually.",
          "2. Provide a 1-sentence energetic live commentary based on the action.",
          "3. Return ONLY a valid JSON object in this exact format: { \"commentary\": \"...\", \"hype\": 80, \"insight\": \"...\" }",
          {
            inlineData: { data: base64Data, mimeType: "image/jpeg" }
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const result = JSON.parse(response.text);
      
      // Emit the real AI-generated commentary to the frontend
      if (result.commentary) {
        io.emit('ai_commentary', { id: Date.now(), text: `[Vision AI] ${result.commentary}`, type: 'insight' });
      }
      if (result.hype) {
        io.emit('hype_update', { value: result.hype });
      }
    } catch (err) {
      console.error("Gemini Vision Error:", err.message);
    }
  });

  // -----------------------------------------------------
  // RANDOM FAN CONNECT (WebRTC Signaling)
  // -----------------------------------------------------
  
  const matchUsers = () => {
    while (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift();
      const user2 = waitingUsers.shift();
      
      activeMatches.set(user1, user2);
      activeMatches.set(user2, user1);
      
      const name1 = users.get(user1)?.name || "Anonymous Fan";
      const name2 = users.get(user2)?.name || "Anonymous Fan";
      
      io.to(user1).emit('match_found', { initiator: true, partnerName: name2 });
      io.to(user2).emit('match_found', { initiator: false, partnerName: name1 });
    }
  };

  socket.on('find_match', () => {
    if (waitingUsers.includes(socket.id)) return;
    
    if (activeMatches.has(socket.id)) {
      const partner = activeMatches.get(socket.id);
      io.to(partner).emit('partner_left');
      activeMatches.delete(partner);
      activeMatches.delete(socket.id);
    }

    waitingUsers.push(socket.id);
    matchUsers();
  });

  socket.on('leave_match', () => {
    waitingUsers = waitingUsers.filter(id => id !== socket.id);
    if (activeMatches.has(socket.id)) {
      const partner = activeMatches.get(socket.id);
      io.to(partner).emit('partner_left');
      activeMatches.delete(partner);
      activeMatches.delete(socket.id);
    }
  });

  socket.on('webrtc_offer', (data) => {
    const partner = activeMatches.get(socket.id);
    if (partner) {
      io.to(partner).emit('webrtc_offer', data);
    }
  });

  socket.on('webrtc_answer', (data) => {
    const partner = activeMatches.get(socket.id);
    if (partner) {
      io.to(partner).emit('webrtc_answer', data);
    }
  });

  socket.on('webrtc_ice_candidate', (data) => {
    const partner = activeMatches.get(socket.id);
    if (partner) {
      io.to(partner).emit('webrtc_ice_candidate', data);
    }
  });

  // -----------------------------------------------------
  // Disconnect Handling
  // -----------------------------------------------------
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(commentaryInterval);
    
    users.delete(socket.id);
    waitingUsers = waitingUsers.filter(id => id !== socket.id);
    
    if (activeMatches.has(socket.id)) {
      const partner = activeMatches.get(socket.id);
      io.to(partner).emit('partner_left');
      activeMatches.delete(partner);
      activeMatches.delete(socket.id);
    }
  });
});

// Handle React Router fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
