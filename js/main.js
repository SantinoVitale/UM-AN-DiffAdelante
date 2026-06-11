// Entrada: wiring consola ↔ worker ↔ análisis numérico ↔ render.

import { algorithms } from "./algorithms.js";
import { buildDiffTable, forwardDerivativeAtX0, relativeErrorPct, classifyComplexity } from "./diff.js";
import {
  renderAlgoCards,
  markActiveAlgo,
  fillParams,
  readParams,
  setRunning,
  setProgress,
  showError,
  clearError,
  renderHeroFormula,
  setupTableTabs,
  renderResults,
} from "./ui.js";
import { renderCostChart, renderDerivChart } from "./plot.js";

let selectedId = "bubbleSort";
let worker = null;

// φ'(nᵢ) en cada fila i de la tabla, usando los términos disponibles (máx. 4)
function forwardDerivativeAtRow(table, h, i, maxTerms) {
  let sum = 0;
  for (let k = 1; k <= maxTerms; k++) {
    const sign = k % 2 === 1 ? 1 : -1;
    sum += (sign * table[k][i]) / k;
  }
  return sum / h;
}

function analyze(algo, { ns, ops, timesMs }) {
  const h = ns[1] - ns[0];
  const tableOps = buildDiffTable(ops);
  const tableTime = buildDiffTable(timesMs);
  const clsOps = classifyComplexity(ns, ops);
  const clsTime = classifyComplexity(ns, timesMs, { tol: 0.25 });

  const nTerms = Math.min(4, ns.length - 1);
  const est = forwardDerivativeAtX0(tableOps, h, nTerms);
  const model = algo.modelDerivative(ns[0]);
  const deriv = {
    n0: ns[0],
    h,
    terms: Array.from({ length: nTerms }, (_, i) => tableOps[i + 1][0]),
    est,
    model,
    errPct: relativeErrorPct(est, model),
  };

  // curva de derivada estimada por punto (hasta el penúltimo)
  const derivNs = ns.slice(0, -1);
  const derivEst = derivNs.map((_, i) =>
    forwardDerivativeAtRow(tableOps, h, i, Math.min(4, ns.length - 1 - i))
  );
  const derivModel = derivNs.map((n) => algo.modelDerivative(n));

  return { algo, ns, ops, timesMs, h, tableOps, tableTime, clsOps, clsTime, deriv, derivNs, derivEst, derivModel };
}

function onBenchmarkDone(result) {
  setRunning(false);
  const algo = algorithms[selectedId];
  try {
    const state = analyze(algo, result);
    renderResults(state);
    renderCostChart(document.getElementById("chart-cost"), state.ns, state.ops, state.timesMs, algo.opsLabel);
    renderDerivChart(document.getElementById("chart-deriv"), state.derivNs, state.derivEst, state.derivModel);
  } catch (err) {
    showError(err.message);
  }
}

function run() {
  clearError();
  let params;
  try {
    params = readParams();
  } catch (err) {
    showError(err.message);
    return;
  }

  if (worker) worker.terminate();
  worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === "progress") setProgress(msg);
    else if (msg.type === "done") onBenchmarkDone(msg.result);
    else if (msg.type === "error") {
      setRunning(false);
      showError(msg.message);
    }
  };
  worker.onerror = (e) => {
    setRunning(false);
    showError(`Error en el worker: ${e.message || "ver consola"}`);
  };

  setRunning(true);
  worker.postMessage({ algoId: selectedId, params });
}

function init() {
  renderHeroFormula();
  renderAlgoCards(algorithms, (id) => {
    selectedId = id;
    fillParams(algorithms[id].defaults);
    clearError();
  });
  markActiveAlgo(selectedId);
  fillParams(algorithms[selectedId].defaults);
  setupTableTabs();
  document.getElementById("btn-run").addEventListener("click", run);
  document.getElementById("btn-defaults").addEventListener("click", () => {
    fillParams(algorithms[selectedId].defaults);
    clearError();
  });
}

document.addEventListener("DOMContentLoaded", init);
