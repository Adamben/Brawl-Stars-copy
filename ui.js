// ui.js
// Requires NippleJS: <script src="https://cdn.jsdelivr.net/npm/nipplejs@0.9.0/dist/nipplejs.min.js"></script>

export default class UI {
  constructor() {
    // Overlay elements
    this.startOv = document.getElementById('startOverlay');
    this.endOv   = document.getElementById('endOverlay');
    this.status  = document.getElementById('connStatus');
    this.healthContainer = document.getElementById('ui');

    // Event callbacks
    this._onStart = null;
    this._onMove  = null;
    this._onAim   = null;
    this._onShoot = null;

    // Bind start button
    document.getElementById('startGame').onclick = () => {
      if (this._onStart) this._onStart();
    };

    // Setup joysticks
    this._setupJoysticks();
  }

  // Callbacks registration
  onStart(cb) { this._onStart = cb; }
  onMove(cb)  { this._onMove  = cb; }
  onAim(cb)   { this._onAim   = cb; }
  onShoot(cb) { this._onShoot = cb; }

  // Health bars
  createHealthBar(id, team=null) {
    const div = document.createElement('div');
    div.id = `hp-${id}`;
    div.innerHTML = `${id}: <progress max="5" value="5"></progress>`;
    if (team) div.classList.add(`team${team}`);
    this.healthContainer.append(div);
  }
  updateHealth(id, val) {
    const p = document.querySelector(`#hp-${id} progress`);
    if (p) p.value = val;
  }

  showStatus(txt) { this.status.textContent = txt; }
  hideStart()    { this.startOv.style.display = 'none'; }
  showEnd(msg)   { 
    document.getElementById('endMsg').textContent = msg;
    this.endOv.style.display = 'flex';
  }

  _setupJoysticks() {
    const leftManager = nipplejs.create({
      zone: document.getElementById('leftZone'),
      mode: 'static', size:150, color:'white'
    });
    leftManager.on('move', (_, data) => {
      const vx = data.vector.x, vy = -data.vector.y;
      if (this._onMove) this._onMove({ x: vx, y: vy });
    });

    const rightManager = nipplejs.create({
      zone: document.getElementById('rightZone'),
      mode: 'static', size:150, color:'white'
    });
    rightManager.on('move', (_, data) => {
      const angle = Math.atan2(-data.vector.y, data.vector.x);
      if (this._onAim) this._onAim(angle);
    });
    rightManager.on('end', (_, data) => {
      const mag = Math.hypot(data?.vector.x||0, data?.vector.y||0);
      if (mag > 0.2 && this._onShoot) {
        // shoot from center of screen? better pass last pos/angle
        this._onShoot({ x: data.position.x, y: data.position.y }, Math.atan2(-data.vector.y, data.vector.x));
      }
    });

    // tap‑to‑shoot fallback
    document.addEventListener('touchstart', ev => {
      const t = ev.touches[0];
      if (t.clientY > window.innerHeight * 0.75) {
        const x = window.innerWidth/2, y = window.innerHeight/2;
        const angle = Math.atan2(t.clientY - y, t.clientX - x);
        if (this._onShoot) this._onShoot({ x, y }, angle);
      }
    });
  }
}
