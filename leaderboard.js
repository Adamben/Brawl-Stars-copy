// leaderboard.js
// Requires Chart.js: <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>

export default class Leaderboard {
  constructor({ containerId = 'leaderboard', type = 'bar' } = {}) {
    // Create canvas
    const container = document.getElementById(containerId);
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    this.ctx = canvas.getContext('2d');
    this.chart = new Chart(this.ctx, {
      type,
      data: {
        labels: [],       // player IDs or team names
        datasets: [{
          label: 'Score',
          data: [],
          backgroundColor: [], // auto-generated
        }]
      },
      options: {
        animation: { duration: 300 },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /**
   * statsObj: { label1: value1, label2: value2, … }
   */
  updateStats(statsObj) {
    const labels = Object.keys(statsObj);
    const data   = labels.map(l => statsObj[l]);
    // simple color array
    const colors = labels.map((_, i) => `hsl(${(i*60)%360}, 70%, 50%)`);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.update();
  }
}
