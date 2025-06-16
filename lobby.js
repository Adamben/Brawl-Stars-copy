// lobby.js
// Requires PeerJS (https://cdn.jsdelivr.net/npm/peerjs@1.4.7/dist/peerjs.min.js)

class Lobby {
  constructor({ myId, roomId, maxPeers = 8, mode = 'FFA' }) {
    this.peer       = new Peer(myId);
    this.roomId     = roomId;
    this.maxPeers   = maxPeers;
    this.mode       = mode; // 'FFA' or '2v2'
    this.peers      = {};   // peerId -> DataConnection
    this.myId       = myId;
    this.onReadyCB  = null;

    this.peer.on('open',    id => console.log(`Peer open: ${id}`));
    this.peer.on('connection', conn => this._setupConn(conn));
    this.peer.on('error',   err => console.error('Peer error:', err));
  }

  // Join an existing room by connecting to the room host
  joinRoom(hostId) {
    this._connect(hostId);
  }

  // Create the room by waiting for others to join
  createRoom() {
    // No-op: just open and wait for incoming connections
  }

  // Register a callback to fire when lobby is “full” or timed-out
  onReady(callback) {
    this.onReadyCB = callback;
  }

  // Internal: initiate a connection
  _connect(peerId) {
    const conn = this.peer.connect(peerId, { reliable: true });
    this._setupConn(conn);
  }

  // Internal: shared connection setup
  _setupConn(conn) {
    conn.on('open', () => {
      console.log(`Connected to ${conn.peer}`);
      this.peers[conn.peer] = conn;
      this._broadcastMeta();
      this._checkReady();
    });

    conn.on('data', data => {
      if (data.meta) {
        this._handleMeta(data.meta);
      }
      // forward other data events to consumers
      if (this.onData) this.onData(conn.peer, data);
    });

    conn.on('close', () => {
      console.log(`Disconnected: ${conn.peer}`);
      delete this.peers[conn.peer];
    });
  }

  // Share my metadata (id & mode) whenever peers change
  _broadcastMeta() {
    const meta = { id: this.myId, mode: this.mode };
    Object.values(this.peers).forEach(c => c.send({ meta }));
  }

  // Handle incoming peer metadata
  _handleMeta(meta) {
    // you could store peer modes / IDs here if needed
    console.log('Peer meta:', meta);
  }

  // Check if we’ve reached maxPeers (or at least 2 for 2v2)
  _checkReady() {
    const count = Object.keys(this.peers).length + 1;
    if (count >= Math.min(this.maxPeers, this.mode === '2v2' ? 4 : this.maxPeers)) {
      // Assign teams if 2v2
      const playerIds = [this.myId, ...Object.keys(this.peers)].sort();
      let teams = null;
      if (this.mode === '2v2') {
        teams = {
          [playerIds[0]]: 1,
          [playerIds[1]]: 1,
          [playerIds[2]]: 2,
          [playerIds[3]]: 2
        };
      }
      if (this.onReadyCB) this.onReadyCB({ peers: playerIds, teams });
    }
  }

  // Send game-data to all peers
  broadcast(obj) {
    Object.values(this.peers).forEach(c => {
      if (c.open) c.send(obj);
    });
  }
}

// Usage Example:
//
// const lobby = new Lobby({ myId: 'player123', roomId: 'roomABC', maxPeers: 8, mode: '2v2' });
//
// // If you’re the host:
// lobby.createRoom();
//
// // If you’re joining:
// lobby.joinRoom('player123');  // connect to host
//
// lobby.onReady(({ peers, teams }) => {
//   console.log('Lobby ready! Players:', peers, 'Teams:', teams);
//   // start the match...
// });
//
// // To send data:
// lobby.broadcast({ type: 'pos', x: px, y: py });
//
// // To receive data, set:
// lobby.onData = (peerId, data) => { ... };

export default Lobby;
