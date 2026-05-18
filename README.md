# 🏏 FanPulse AI - The Future of Interactive Sports Streaming

![FanPulse AI Banner](https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop) *(Placeholder for project screenshot)*

## 🌟 Overview
**FanPulse AI** is a next-generation sports engagement platform designed to revolutionize how fans experience live sports. Moving away from the traditional, passive TV viewing experience, FanPulse turns every live match into a globally connected, highly interactive, and AI-driven virtual stadium. 

We solve the "Second Screen Problem" (where fans watch a match on TV but scroll Twitter/Reddit on their phones) by bringing the match, the community, the gamification, and AI insights into **one seamless platform**.

---

## ✨ Core Features & Uniqueness

### 1. 🌍 Live Fan Connect (WebRTC Video Chat)
* **The Idea:** Sports are best enjoyed with friends. But what if you are watching alone?
* **The Execution:** Instantly connect face-to-face with a random fan from across the globe via a built-in Omegle-style video chat. Debate the last wicket, celebrate a boundary, and share the hype in real-time without ever leaving the match screen.

### 2. 🎯 Next Ball Prediction Engine
* **The Idea:** Keep users glued to every single delivery.
* **The Execution:** A gamified engagement loop. An 8-second countdown window opens right before the bowler takes their run-up. Fans lock in their prediction (Boundary, Wicket, Dot ball). If they guess right, they earn points and climb the live global leaderboard. High dopamine, low barrier to entry.

### 3. 🤖 AI-Powered Live Insights (Powered by Google Gemini)
* **The Idea:** Move beyond generic TV commentary.
* **The Execution:** Our backend engine constantly monitors the live match state (Runs, Wickets, Run Rate). It feeds this data into the **Google Gemini API**, which generates hyper-contextual, dynamic, and energetic commentary in real-time. It reads the pressure of the game and delivers expert insights instantly.

### 4. 🔊 Global Crowd Energy Map
* **The Idea:** Recreate the stadium noise for digital viewers.
* **The Execution:** Using Geolocation and microphone APIs, fans can literally "cheer" into their devices. The app tracks the audio decibels and maps it to their city (using Nominatim API). The result? A live UI showing which city in the world is making the most noise right now!

### 5. 🎤 Ask The Dugout
* **The Idea:** Give fans a voice.
* **The Execution:** A Reddit-style, upvoted Q&A system. Fans can pose strategic questions directed at the "Captain" or "Bowling Coach." AI moderates the questions, and the most upvoted ones trend globally.

---

## 🎨 Premium OTT-Style UI/UX
Built with a "Hotstar/Premium Sports App" aesthetic. 
- **Dark Mode Native:** Sleek navy/slate dark themes that reduce eye strain during long matches.
- **Non-Intrusive:** The video player remains the hero of the screen. Engagement features (Scorecard, Chat, Predictions) are housed in a clean 30% right-side panel.
- **Micro-animations:** Subtle glowing borders, pulse animations during searching phases, and smooth tab transitions to make the app feel alive.

---

## ⚙️ Tech Stack & Architecture

- **Frontend**: React.js, Tailwind CSS (for premium styling), Framer Motion, Lucide Icons, Recharts (for data visualization).
- **Backend**: Node.js, Express.js.
- **Real-Time Engine**: Socket.io (Handles live score syncing, prediction windows, and WebRTC signaling).
- **Peer-to-Peer Video**: WebRTC with STUN/TURN servers for seamless Fan-to-Fan video connections.
- **AI Integration**: Google Gemini API (`@google/genai`) for real-time contextual commentary.
- **Location & Data**: HTML5 Geolocation + OpenStreetMap Nominatim API.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key

### 1. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder and add your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```
Start the server:
```bash
node server.js
```
*(The backend runs on port 5001 and includes a 24/7 mock match engine that automatically bowls a ball every 15 seconds).*

### 2. Setup the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will start on port 5173).*

---

## 💡 Why This Wins (The Hackathon Angle)
Broadcasters today are struggling to retain **Gen-Z audiences** who demand interactivity and rapid dopamine hits. **FanPulse AI** proves that sports broadcasting doesn't have to be a one-way street. By merging high-quality streaming with AI, WebRTC, and gamification, FanPulse creates a highly monetizable, deeply engaging platform that keeps users on the screen for the entire duration of the match.
