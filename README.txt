MISSION LANKA — SHARED QUESTION + RAVAN DAHAN EDITION

WHAT CHANGED
- Players join from / and choose a name, team, and room code.
- Host login is on the separate private route /host.html; login fields are not shown on the player page or host dashboard.
- All players and the host see the same live question.
- There are 10 shared Ramayana/Dussehra questions.
- The first correct answer wins that question, awards that team 1 point, and bursts one head. Host clicks Next question to reveal the next shared question to everyone.
- After Question 10 is solved and the host advances, the winner is calculated. Host then launches the synchronized grand Ravan Dahan.
- WebSockets sync scores, players, question, activity, and head count in real time.

RUN LOCALLY
1. Install Node.js 18+.
2. In this folder: npm install
3. Set environment variables before starting (recommended):
   Windows PowerShell:
     $env:HOST_USER="your-host-name"
     $env:HOST_PASSWORD="a-long-unique-password"
     $env:ROOM_CODE="YOURROOMCODE"
     npm.cmd start
   Railway: add HOST_USER, HOST_PASSWORD, ROOM_CODE in service Variables and redeploy.
4. Open http://localhost:3000/ for players.
5. Open http://localhost:3000/host.html for the host login.

RAILWAY DEPLOY
- Upload/push the contents of this folder to the GitHub repository connected to your Railway service (package.json, server.js, public/).
- Do not upload node_modules or any passwords.
- In Railway Variables, set HOST_USER, HOST_PASSWORD, ROOM_CODE. Use a new strong password; never put it in source code.
- Railway start command: npm start (auto-detected from package.json).
- Generate a public domain and ensure the service target port matches PORT (Railway injects PORT automatically).
- Open public URL / for players; host uses the same domain plus /host.html.

IMPORTANT
- The host must click Start quiz. When a correct answer comes in, the host clicks Next question to move all devices to the next question. This allows time to announce the scoring team.
- After the 10th question is solved, click Next question once more to finish the quiz and calculate the winner, then click Grand Ravan Dahan.
- The game state is in server memory. Restarting/redeploying resets game progress; do not redeploy during the event.
- This is a simple event game, not a hardened production authentication system. Share the room code only with participants and test multiple devices before the event.
