// client.js
// Imports (adjust paths as needed)
import Lobby from './lobby.js';
import Physics from './physics.js';
import UI from './ui.js';

const MAX_PLAYERS = 8;
const MODE       = '2v2';         // or 'FFA'
const MAP_URL    = '/maps/arena1.json';

// 1) Initialize Lobby
const myId  = prompt('Enter your player ID:');
const host  = confirm('Are you hosting? OK=Yes, Cancel=No');
const lobby = new Lobby({ myId, maxPeers: MAX_PLAYERS, mode: MODE });

if (host) {
  lobby.createRoom();
} else {
  const hostId = prompt('Host Peer ID to join:');
  lobby.joinRoom(hostId);
}

// 2) Prepare UI
const ui = new UI();
ui.onStart(() => ui.hideStart());

// 3) When lobby is ready...
lobby.onReady(async ({ players, teams }) => {
  ui.showStatus(`Game starting with: ${players.join(', ')}`);
  
  // 4) Initialize Physics
  const phys = new Physics({
    canvasId: 'game',
    width: window.innerWidth,
    height: window.innerHeight,
    mapUrl: MAP_URL
  });

  // 5) Create player bodies
  const playersMap = {};  // peerId → { body, health, team }
  players.forEach((pid, i) => {
    const startX = i < 4 ? 100 : window.innerWidth - 100;
    const startY = 100 + (i % 4) * 80;
    const body = Matter.Bodies.circle(startX, startY, 20, { label: pid });
    Matter.World.add(phys.world, body);
    playersMap[pid] = { body, health: 5, team: teams?.[pid] ?? null };
    ui.createHealthBar(pid, teams?.[pid]);
  });

  // 6) Handle collisions (bullets ↔ players)
  phys.onCollision = (a, b, pair) => {
    // bullet label = 'bullet:<ownerId>'
    if (a.startsWith('bullet:') && playersMap[b]) {
      const owner = a.split(':')[1];
      if (b === myId) {
        // I got hit locally
        playersMap[b].health--;
        ui.updateHealth(b, playersMap[b].health);
        lobby.broadcast({ type:'damage', target:b });
      }
      // destroy bullet body
      Matter.World.remove(phys.world, pair.bodyA);
    }
  };

  // 7) Receive network data
  lobby.onData = (peerId, data) => {
    switch(data.type) {
      case 'move':
        Matter.Body.setPosition(playersMap[peerId].body, data.pos);
        break;
      case 'aim':
        // store last aim for that peer
        playersMap[peerId].angle = data.angle;
        break;
      case 'shoot':
        spawnBullet(peerId, data.pos, data.angle);
        break;
      case 'damage':
        playersMap[data.target].health--;
        ui.updateHealth(data.target, playersMap[data.target].health);
        break;
    }
  };

  // 8) Wire up UI input → broadcast
  ui.onMove(vec => {
    const meBody = playersMap[myId].body;
    Matter.Body.setVelocity(meBody, { x: vec.x*5, y: vec.y*5 });
    lobby.broadcast({ type:'move', pos: meBody.position });
  });
  ui.onAim(angle => {
    lobby.broadcast({ type:'aim', angle });
  });
  ui.onShoot((pos, angle) => {
    spawnBullet(myId, pos, angle);
    lobby.broadcast({ type:'shoot', pos, angle });
  });

  // 9) Game loop
  function gameLoop() {
    phys.step();
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
});

// Helper to create bullet bodies
function spawnBullet(ownerId, startPos, angle) {
  const bullet = Matter.Bodies.circle(
    startPos.x + Math.cos(angle)*30,
    startPos.y + Math.sin(angle)*30,
    5,
    { label:`bullet:${ownerId}`, frictionAir:0 }
  );
  Matter.Body.setVelocity(bullet, {
    x: Math.cos(angle)*10,
    y: Math.sin(angle)*10
  });
  // add and auto-remove after 3s
  phys.world.add(phys.world, bullet);
  setTimeout(() => Matter.World.remove(phys.world, bullet), 3000);
}
