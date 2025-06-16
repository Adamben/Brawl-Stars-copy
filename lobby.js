// lobby.js
// Requires PeerJS: <script src="https://cdn.jsdelivr.net/npm/peerjs@1.4.7/dist/peerjs.min.js"></script>

export default class Lobby {
  constructor({ myId, maxPeers = 8, mode = 'FFA' }) {
    this.peer      = new Peer(myId);
    this.myId      = myId;
    this.maxPeers  = maxPeers;
    this.mode      = mode;   // 'FFA' or '2v2'
    this.peers     = {};     // peerId → DataConnection
    this.onReadyCB = null;
    this.onData    = null;

    this.peer.on('open', id => console.log(`[Lobby] Peer open: ${id}`));
    this.peer.on('connection', conn => this._setupConn(conn));
    this.peer.on('error', err => console.error('[Lobby] Peer error:', err));
  }

  // Host: call to start listening
  createRoom() {
    console.log('[Lobby] Room created, waiting for peers...');
  }

  // Guest: call to connect to host
  joinRoom(hostId) {
    const conn = this.peer.connect(hostId, { reliable: true });
    this._setupConn(conn);
  }

  // Register a callback for when lobby is “full”
  onReady(cb) {
    this.onReadyCB = cb;
  }

  // Send arbitrary data to all peers
  broadcast(obj) {
    Object.values(this.peers).forEach(c => {
      if (c.open) c.send(obj);
    });
  }

  // Internal: wrap a new DataConnection
  _setupConn(conn) {
    conn.on('open', () => {
      console.log(`[Lobby] Connected to ${conn.peer}`);
      this.peers[conn.peer] = conn;
      this._syncMeta();
      this._checkReady();
    });

    conn.on('data', data => {
      if (data.meta) this._handleMeta(data.meta);
      if (this.onData) this.onData(conn.peer, data);
    });

    conn.on('close', () => {
      console.log(`[Lobby] Disconnected: ${conn.peer}`);
      delete this.peers[conn.peer];
    });
  }

  // Share own ID/mode with everyone
  _syncMeta() {
    const meta = { id: this.myId, mode: this.mode };
    this.broadcast({ meta });
  }

  _handleMeta(meta) {
    console.log('[Lobby] Peer meta received:', meta);
  }

  // When enough players have joined, fire onReady
  _checkReady() {
    const total = Object.keys(this.peers).length + 1;
    const needed = this.mode === '2v2' ? 4 : this.maxPeers;
    if (total >= Math.min(needed, this.maxPeers)) {
      const ids = [this.myId, ...Object.keys(this.peers)].sort();
      let teams = null;
      if (this.mode === '2v2') {
        teams = { [ids[0]]:1, [ids[1]]:1, [ids[2]]:2, [ids[3]]:2 };
      }
      if (this.onReadyCB) this.onReadyCB({ players: ids, teams });
    }
  }
}
