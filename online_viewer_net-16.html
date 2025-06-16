// physics.js
// Requires Matter.js: <script src="https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js"></script>

import { Engine, Render, Runner, World, Bodies, Body, Events } from 'matter-js';

export default class Physics {
  constructor({ canvasId, width, height, mapUrl }) {
    this.engine = Engine.create();
    this.world  = this.engine.world;

    // Renderer (optional—useful for debugging)
    this.render = Render.create({
      element: document.body,
      canvas: document.getElementById(canvasId),
      engine: this.engine,
      options: {
        width, height,
        wireframes: false,
        background: '#222'
      }
    });
    Render.run(this.render);

    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);

    // load walls + blocks
    fetch(mapUrl)
      .then(r => r.json())
      .then(map => this._buildMap(map))
      .catch(err => console.error('[Physics] Map load error:', err));

    // collision event forwarding
    Events.on(this.engine, 'collisionStart', event => {
      event.pairs.forEach(pair => {
        const a = pair.bodyA.label, b = pair.bodyB.label;
        if (this.onCollision) this.onCollision(a, b, pair);
      });
    });
  }

  // Build static walls and dynamic blocks from JSON
  _buildMap(map) {
    map.walls.forEach(w => {
      const wall = Bodies.rectangle(w.x, w.y, w.w, w.h, {
        isStatic: true, label: 'wall', render: { fillStyle: w.color || '#444' }
      });
      World.add(this.world, wall);
    });

    map.blocks.forEach(b => {
      const block = Bodies.rectangle(b.x, b.y, b.w, b.h, {
        isStatic: false, label: b.label || 'block',
        restitution: b.restitution || 0.5,
        render: { fillStyle: b.color || '#888' }
      });
      if (b.velocity) {
        Body.setVelocity(block, { x: b.velocity.x, y: b.velocity.y });
      }
      World.add(this.world, block);
    });
  }

  // Step the physics engine (if you want manual stepping)
  step(delta = 1000 / 60) {
    Engine.update(this.engine, delta);
  }

  // External callback setter
  onCollision(pairA, pairB, rawPair) {
    // override in consumer
  }
}
