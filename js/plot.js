// Chart viene como global desde el CDN

let chartInstance = null;

export function destroyPlot() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

export function renderPlot(canvasId, expr, xs, x0, slopeAtX0) {
  destroyPlot();
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  const step = xs[1] - xs[0];
  const xMin = xs[0] - step;
  const xMax = xs[xs.length - 1] + step;
  const N_CURVE = 200;

  const curve = [];
  for (let i = 0; i < N_CURVE; i++) {
    const x = xMin + (xMax - xMin) * i / (N_CURVE - 1);
    try {
      curve.push({ x, y: expr.eval(x) });
    } catch (_) { /* skip puntos no definidos */ }
  }

  const pointsData = xs.map(x => ({ x, y: expr.eval(x) }));
  const y0 = expr.eval(x0);
  const tangent = [
    { x: xMin, y: y0 + slopeAtX0 * (xMin - x0) },
    { x: xMax, y: y0 + slopeAtX0 * (xMax - x0) },
  ];

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'f(x)',
          data: curve,
          borderColor: '#22d3ee',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'puntos',
          data: pointsData,
          type: 'scatter',
          backgroundColor: '#a78bfa',
          pointRadius: 6,
        },
        {
          label: `tangente x₀=${x0}`,
          data: tangent,
          borderColor: '#f472b6',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 1.5,
        },
      ]
    },
    options: {
      scales: {
        x: { type: 'linear', grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
      },
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}
