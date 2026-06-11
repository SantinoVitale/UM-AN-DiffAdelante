// Wrappers de Chart.js (global `Chart` desde CDN). Tema del instrumento.

const OPS = "#6dffb0";
const TIME = "#ffb454";
const INK_DIM = "#97a48a";
const GRID = "rgba(109, 255, 176, 0.08)";
const FONT = { family: "'IBM Plex Mono', monospace", size: 10 };

let costChart = null;
let derivChart = null;

function axis(title, color = INK_DIM) {
  return {
    title: { display: true, text: title, color, font: FONT },
    ticks: { color, font: FONT },
    grid: { color: GRID },
  };
}

const commonOpts = {
  responsive: true,
  animation: { duration: 400 },
  plugins: {
    legend: { labels: { color: INK_DIM, font: FONT, boxWidth: 14 } },
    tooltip: { titleFont: FONT, bodyFont: FONT },
  },
};

export function renderCostChart(canvas, ns, ops, timesMs, opsLabel) {
  if (costChart) costChart.destroy();
  costChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: ns,
      datasets: [
        {
          label: `operaciones (${opsLabel})`,
          data: ops,
          borderColor: OPS,
          backgroundColor: OPS,
          pointRadius: 4,
          pointStyle: "rectRot",
          tension: 0.25,
          yAxisID: "y",
        },
        {
          label: "tiempo (ms, mediana)",
          data: timesMs,
          borderColor: TIME,
          backgroundColor: TIME,
          pointRadius: 4,
          pointStyle: "circle",
          borderDash: [6, 4],
          tension: 0.25,
          yAxisID: "y2",
        },
      ],
    },
    options: {
      ...commonOpts,
      scales: {
        x: axis("n (tamaño del problema)"),
        y: { ...axis("operaciones", OPS), position: "left" },
        y2: { ...axis("ms", TIME), position: "right", grid: { drawOnChartArea: false } },
      },
    },
  });
}

export function renderDerivChart(canvas, ns, estimated, model) {
  if (derivChart) derivChart.destroy();
  derivChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: ns,
      datasets: [
        {
          label: "φ'(nᵢ) por diferencias hacia adelante",
          data: estimated,
          borderColor: OPS,
          backgroundColor: OPS,
          pointRadius: 5,
          pointStyle: "rectRot",
          showLine: false,
        },
        {
          label: "derivada del modelo teórico",
          data: model,
          borderColor: INK_DIM,
          backgroundColor: INK_DIM,
          pointRadius: 0,
          borderDash: [2, 3],
          tension: 0.25,
        },
      ],
    },
    options: {
      ...commonOpts,
      scales: {
        x: axis("n"),
        y: axis("dT/dn (ops por unidad de n)"),
      },
    },
  });
}
