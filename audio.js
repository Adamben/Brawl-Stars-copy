// audio.js
// Requires Howler.js: <script src="https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js"></script>

export default class AudioManager {
  constructor() {
    this.sounds = {
      shoot: new Howl({ src: ['/assets/sfx/shoot.wav'], volume: 0.5 }),
      hit:   new Howl({ src: ['/assets/sfx/hit.wav'],   volume: 0.6 }),
      win:   new Howl({ src: ['/assets/sfx/win.wav'],   volume: 0.7 }),
      lose:  new Howl({ src: ['/assets/sfx/lose.wav'],  volume: 0.7 }),
    };
    this.music = new Howl({
      src: ['/assets/music/loop.mp3'],
      loop: true,
      volume: 0.3
    });
  }

  playMusic() {
    if (!this.music.playing()) this.music.play();
  }
  stopMusic() {
    this.music.stop();
  }

  playSFX(name) {
    const s = this.sounds[name];
    if (s) s.play();
  }
}
