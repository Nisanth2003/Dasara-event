const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
app.get('/health', (_req, res) => res.json({ ok: true, app: 'Mission Lanka Live' }));

const PORT = process.env.PORT || 3000;
const HOST_USER = process.env.HOST_USER || 'host';
const HOST_PASSWORD = process.env.HOST_PASSWORD || 'Lanka!2026';
const ROOM_CODE = (process.env.ROOM_CODE || 'LANKA25').toUpperCase();
const DURATION_SECONDS = 15 * 60;
const teams = [
  { id:'agni', name:'Agni', color:'#fb7185', icon:'🔥', puzzles:[
    {q:'Ramayana challenge: Which brother of Ravana left Lanka and joined Rama, later becoming king of Lanka?', hint:'His name begins with V; he chose dharma over loyalty to Ravana.', answer:'VIBHISHANA', word:'DISCERNMENT'},
    {q:'In many Ramayana tellings, which vanara craftsman is credited with building the bridge to Lanka with the army of vanaras?', hint:'He is associated with the construction of Rama Setu; his name begins with N.', answer:'NALA', word:'TEAMWORK'}]},
  { id:'vayu', name:'Vayu', color:'#38bdf8', icon:'🌬️', puzzles:[
    {q:'When Lakshmana was gravely wounded, Hanuman brought a life-restoring herb from which mountain traditionally named in many tellings?', hint:'It is often called the mountain of medicinal herbs; the name starts with D.', answer:'DRONAGIRI', word:'DEVOTION'},
    {q:'What is the name commonly given to the ninth day of Navratri, observed just before Vijayadashami in many traditions?', hint:'It is also called the Great Navami.', answer:'MAHANAVAMI', word:'PERSEVERANCE'}]},
  { id:'astra', name:'Astra', color:'#c084fc', icon:'🏹', puzzles:[
    {q:'Rama is often depicted carrying a bow. What is the traditional name of Rama’s bow in many Hindu traditions?', hint:'It begins with K and is often used as an epithet for Rama too.', answer:'KODANDA', word:'DHARMA'},
    {q:'What is the other well-known name of Ravana’s son Indrajit, famed for his mastery of illusion and celestial weapons?', hint:'The name means “the one who conquered Indra.”', answer:'MEGHANADA', word:'COURAGE'}]},
  { id:'vajra', name:'Vajra', color:'#fbbf24', icon:'⚡', puzzles:[
    {q:'Which wise elder of the vanara army reminded Hanuman of his extraordinary abilities before the leap to Lanka?', hint:'His name begins with J; he is often portrayed as a bear-like king.', answer:'JAMBAVAN', word:'CONFIDENCE'},
    {q:'In the golden-deer episode, which rakshasa took the form of the deer to lure Rama away from Sita?', hint:'He was compelled by Ravana to help with the abduction plan.', answer:'MARICHA', word:'DISCERNMENT'}]},
  { id:'surya', name:'Surya', color:'#4ade80', icon:'☀️', puzzles:[
    {q:'Which woman in Ashoka Vatika, in a well-known Ramayana episode, dreams of Rama’s victory and Ravana’s downfall and comforts Sita?', hint:'Her name begins with T and she is a rakshasi who sympathises with Sita.', answer:'TRIJATA', word:'HOPE'},
    {q:'In several parts of India, what is the name of the ritual worship of tools, instruments, and vehicles observed during Navratri or Vijayadashami?', hint:'The name combines “ayudha” (weapon/tool) with “puja” (worship).', answer:'AYUDHAPUJA', word:'GRATITUDE'}]}
];
let room = freshRoom();
function freshRoom(){ return { code:ROOM_CODE, status:'lobby', startedAt:null, endsAt:null, createdAt:Date.now(), hostConnected:false, players:{}, teams:Object.fromEntries(teams.map(t=>[t.id,{solved:0,score:0,words:[],heads:0,activePuzzle:0,completed:false}])) , finalUnlocked:false, finaleStarted:false, winner:null, feed:[] }; }
function safeState(){
 const teamState = teams.map(t=>({id:t.id,name:t.name,color:t.color,icon:t.icon,...room.teams[t.id],members:Object.values(room.players).filter(p=>p.team===t.id).map(p=>({name:p.name,online:p.online,solved:p.solved}))}));
 return {code:room.code,status:room.status,startedAt:room.startedAt,endsAt:room.endsAt,remaining:room.status==='running'?Math.max(0,Math.ceil((room.endsAt-Date.now())/1000)):null,teams:teamState,players:Object.values(room.players).map(p=>({id:p.id,name:p.name,team:p.team,online:p.online,solved:p.solved})),finalUnlocked:room.finalUnlocked,finaleStarted:room.finaleStarted,feed:room.feed.slice(-12),puzzles:teams.map(t=>({team:t.id,puzzle:room.teams[t.id].activePuzzle,items:t.puzzles.map((p,i)=>({q:p.q,hint:p.hint,word:p.word,solved:i<room.teams[t.id].solved}))}))};
}
function broadcast(){io.to(ROOM_CODE).emit('state',safeState());}
function log(message,team){room.feed.push({id:crypto.randomUUID(),at:Date.now(),message,team:team||null});room.feed=room.feed.slice(-30);}
function teamById(id){return teams.find(t=>t.id===id);}
function norm(s){return String(s||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');}
function checkTimeout(){if(room.status==='running' && Date.now()>=room.endsAt){room.status='ended';log('The countdown has ended. Host may launch the finale.');broadcast();}}
setInterval(()=>{checkTimeout(); if(room.status==='running') broadcast();},1000);

io.on('connection', socket=>{
 socket.emit('state',safeState());
 socket.on('host:login',(data,cb=()=>{})=>{
   if(String(data?.username||'')!==HOST_USER || String(data?.password||'')!==HOST_PASSWORD) return cb({ok:false,error:'Incorrect host username or password.'});
   socket.data.role='host'; socket.data.room=ROOM_CODE; socket.join(ROOM_CODE); room.hostConnected=true; socket.emit('host:answers', teams.map(t=>({team:t.id,items:t.puzzles.map(p=>({answer:p.answer,word:p.word,hint:p.hint}))}))); log('Host connected to the control room.'); broadcast(); cb({ok:true,state:safeState()});
 });
 socket.on('player:join',(data,cb=()=>{})=>{
   if(norm(data?.code)!==ROOM_CODE) return cb({ok:false,error:'That room code is not correct.'});
   const name=String(data?.name||'').trim().slice(0,32); const team=teamById(String(data?.team||''));
   if(name.length<2) return cb({ok:false,error:'Please enter a name with at least 2 characters.'});
   if(!team) return cb({ok:false,error:'Please choose a team.'});
   if(room.status==='ended' || room.finaleStarted) return cb({ok:false,error:'This game has ended. Ask the host to reset it.'});
   const id=crypto.randomUUID(); room.players[id]={id,name,team:team.id,online:true,solved:room.teams[team.id].solved,joinedAt:Date.now()};
   socket.data.role='player';socket.data.playerId=id;socket.data.room=ROOM_CODE;socket.join(ROOM_CODE);log(`${name} joined Team ${team.name}.`,team.id);broadcast();cb({ok:true,id,team:team.name,state:safeState()});
 });
 socket.on('player:answer',(data,cb=()=>{})=>{
   if(socket.data.role!=='player') return cb({ok:false,error:'Join as a player first.'});
   checkTimeout(); const player=room.players[socket.data.playerId];
   if(!player || !player.online) return cb({ok:false,error:'Your player session is no longer active. Rejoin the room.'});
   if(room.status!=='running') return cb({ok:false,error:'The host has not started the game yet.'});
   const t=teamById(player.team), ts=room.teams[player.team];
   if(ts.completed) return cb({ok:false,error:'Your team has completed all its puzzles!'});
   const index=ts.solved, puzzle=t.puzzles[index];
   if(!puzzle) return cb({ok:false,error:'No puzzle available.'});
   if(norm(data?.answer)!==norm(puzzle.answer)) {log(`${player.name} submitted an incorrect answer for Team ${t.name}.`,t.id);broadcast();return cb({ok:false,error:'Not quite! Try again, or ask the host for a hint.'});}
   ts.solved++;ts.score+=100;ts.words.push(puzzle.word);ts.heads++;player.solved=ts.solved;
   if(ts.solved>=t.puzzles.length) ts.completed=true; else ts.activePuzzle=ts.solved;
   log(`💥 Team ${t.name} cracked puzzle ${ts.solved}! Word unlocked: ${puzzle.word}. A Ravan head has burst!`,t.id);
   if(teams.every(x=>room.teams[x.id].completed)) {room.finalUnlocked=true;log('All teams have completed their challenges. The final code is unlocked!');}
   broadcast();cb({ok:true,word:puzzle.word,team:t.name,completed:ts.completed,state:safeState()});
 });
 socket.on('player:hint',(_data,cb=()=>{})=>{
   if(socket.data.role!=='player') return cb({ok:false,error:'Join as a player first.'});
   const p=room.players[socket.data.playerId]; if(!p)return cb({ok:false,error:'Rejoin the room.'});
   const t=teamById(p.team), ts=room.teams[p.team]; const puzzle=t.puzzles[ts.solved];
   if(!puzzle)return cb({ok:false,error:'No hint needed.'});
   cb({ok:true,hint:puzzle.hint});
 });
 socket.on('host:action',(data,cb=()=>{})=>{
   if(socket.data.role!=='host')return cb({ok:false,error:'Host login required.'});
   const action=data?.action;
   if(action==='start') {if(room.status==='running')return cb({ok:false,error:'Game is already running.'});if(room.status==='ended')return cb({ok:false,error:'Reset the game before starting again.'});room.status='running';room.startedAt=Date.now();room.endsAt=Date.now()+DURATION_SECONDS*1000;log('🚀 Mission Lanka is LIVE! Solve your team puzzles before time runs out.');}
   else if(action==='pause'){if(room.status!=='running')return cb({ok:false,error:'The game is not running.'});room.status='paused';room.pausedRemaining=Math.max(0,room.endsAt-Date.now());room.endsAt=null;log('Host paused the countdown.');}
   else if(action==='resume'){if(room.status!=='paused')return cb({ok:false,error:'The game is not paused.'});room.status='running';room.endsAt=Date.now()+(room.pausedRemaining||0);log('Countdown resumed.');}
   else if(action==='hint'){const team=teamById(String(data.team||''));if(!team)return cb({ok:false,error:'Choose a team.'});const ts=room.teams[team.id],p=team.puzzles[ts.solved];if(!p)return cb({ok:false,error:'That team has finished.'});log(`Host hint for ${team.name}: ${p.hint}`,team.id);}
   else if(action==='finale'){if(!room.finalUnlocked)return cb({ok:false,error:'The finale unlocks when all five teams finish both puzzles.'});room.finaleStarted=true;room.status='ended';log('🎆 The host launched the final Ravan Dahan! Victory to all teams.');}
   else if(action==='reset'){room=freshRoom();log('A new Mission Lanka room is ready. Players may need to refresh.');}
   else return cb({ok:false,error:'Unknown host action.'});
   broadcast();cb({ok:true,state:safeState()});
 });
 socket.on('disconnect',()=>{if(socket.data.role==='player'&&room.players[socket.data.playerId]){room.players[socket.data.playerId].online=false;log(`${room.players[socket.data.playerId].name} disconnected.`,room.players[socket.data.playerId].team);broadcast();}if(socket.data.role==='host'){room.hostConnected=false;broadcast();}});
});
server.listen(PORT,()=>console.log(`Mission Lanka Live listening on ${PORT}`));
