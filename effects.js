// effects.js
// Requires Animate.css: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"/>

export default class Effects {
  constructor({ canvasId = 'game' } = {}) {
    this.canvas = document.getElementById(canvasId);
    // container for popups
    this.popupLayer = document.createElement('div');
    this.popupLayer.style.position = 'absolute';
    this.popupLayer.style.top = '0';
    this.popupLayer.style.left = '0';
    this.popupLayer.style.width = '100%';
    this.popupLayer.style.height = '100%';
    this.popupLayer.style.pointerEvents = 'none';
    document.body.appendChild(this.popupLayer);
  }

  flashScreen(color = '#fff', duration = 100) {
    this.canvas.style.transition = `background ${duration}ms`;
    const orig = this.canvas.style.background;
    this.canvas.style.background = color;
    setTimeout(() => { this.canvas.style.background = orig; }, duration);
  }

  shakeScreen(intensity = 5, duration = 300) {
    this.canvas.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => {
      this.canvas.classList.remove('animate__animated', 'animate__shakeX');
    }, duration);
  }

  popupText(text, x, y, options = {}) {
    const span = document.createElement('span');
    span.textContent = text;
    span.style.position = 'absolute';
    span.style.left = `${x}px`;
    span.style.top  = `${y}px`;
    span.style.fontSize = '24px';
    span.style.fontWeight = 'bold';
    span.style.color = options.color || '#ff0';
    span.classList.add('animate__animated', 'animate__fadeOutUp');
    this.popupLayer.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }
}
