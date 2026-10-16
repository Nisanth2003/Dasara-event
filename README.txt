MISSION LANKA LIVE — REAL-TIME MULTIPLAYER DEMO

WHAT THIS APP DOES
- Separate host sign-in and player join flow
- Shared room code, default LANKA25
- Five teams with two puzzles each (10 puzzles total)
- Real-time team progress, points, revealed words, activity feed, and head-burst animations
- Host start/pause/resume/reset controls and finale launch
- Live updates through Socket.IO

RUN LOCALLY
1. Install Node.js 18 or newer.
2. Extract this folder.
3. In this folder run: npm install
4. Set host credentials (recommended):
   Linux/macOS: HOST_USER=yourhost HOST_PASSWORD='choose-a-strong-password' ROOM_CODE=TEAM2026 npm start
   PowerShell:  $env:HOST_USER='yourhost'; $env:HOST_PASSWORD='choose-a-strong-password'; $env:ROOM_CODE='TEAM2026'; npm start
   Or for a quick local demo only: npm start
5. Open http://localhost:3000 in your browser.
6. Host login defaults (demo only): host / Lanka!2026
7. Players use room code LANKA25 by default.

DEPLOY FOR MICROSOFT TEAMS
Deploy this Node.js app to a host that supports long-running Node.js web services and WebSockets, such as Render, Railway, or a similar Node service platform. Do NOT deploy as a static-only site or Netlify Drop: the server is required for live multiplayer.

Typical Render setup:
- Create a new Web Service from a Git repository containing these files.
- Runtime: Node
- Build command: npm install
- Start command: npm start
- Add environment variables: HOST_USER, HOST_PASSWORD, ROOM_CODE (optional PORT is provided by the platform).
- Deploy, then share the service HTTPS URL and room code with participants in Teams.

IMPORTANT LIMITATIONS / SAFETY
- This is a complete clickable real-time prototype, but room state is held in server memory. If the service restarts/redeploys, the game state resets. For a large or business-critical event, add persistent storage and proper session authentication.
- The demo's host login is a simple shared username/password. Set a unique strong HOST_PASSWORD before sharing the URL. For production, implement rate limiting and robust authentication.
- Anyone with the room code can join as a player; this is suitable for a private event link, not a public high-security application.
- It uses WebSockets, so choose a host that supports persistent Node services and WebSockets.
- Team puzzles and answer checking happen server-side; players do not receive answer keys from the browser.
- The virtual Ravan Dahan is a symbolic on-screen animation, not a real fire or physical activity.

GAME FLOW
- Host logs in and clicks Start 15-minute mission.
- Each team solves its two challenges in order. Every correct answer earns 100 points, reveals one word, increments that team's head-burst count, and updates all connected dashboards immediately.
- When all five teams finish both puzzles, the host's finale button becomes available.
- Host clicks Launch final Ravan Dahan. Everyone sees the celebration overlay.

UPDATED DUSSEHRA / RAMAYANA PUZZLES
Each team has two mythology/festival questions. Every correct answer unlocks one celebration word:
- Agni: Jatayu -> COURAGE; Rama Setu -> UNITY
- Vayu: Lakshmana -> LOYALTY; Diwali -> LIGHT
- Astra: Rama -> DHARMA; Lanka -> VICTORY
- Vajra: Ravana -> GOODNESS; Sita -> TRUTH
- Surya: Hanuman -> DEVOTION; Dussehra -> PEACE
The game accepts answers without regard to letter case or spaces/punctuation (e.g. RAM SETU or RAMSETU).


QUESTION UPDATE (medium challenge)
Each team has two less-obvious questions related to Ramayana lore and regional Dussehra/Navratri traditions. The answer key and hints are served by server.js, so the player interface and host guide use the same updated question set.
