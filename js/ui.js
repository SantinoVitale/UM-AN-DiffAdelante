// Helpers de DOM: cards de algoritmos, parámetros, progreso, KaTeX, tablas.
// `katex` viene como global desde el CDN.

const $ = (id) => document.getElementById(id);

// ---------- formato numérico (es-AR: miles con punto, decimales con coma) ----------

export function fmt(v) {
  if (!Number.isFinite(v)) return "—";
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e9 || a < 1e-4)) {
    return v.toExponential(3).replace(".", ",");
  }
  if (Number.isInteger(v)) return v.toLocaleString("es-AR");
  return v.toLocaleString("es-AR", { maximumFractionDigits: a < 1 ? 6 : 3 });
}

function fmtLatex(v) {
  if (Number.isInteger(v) && Math.abs(v) < 1e9) return String(v);
  return Number(v.toPrecision(6)).toString();
}

// ---------- consola ----------

export function renderAlgoCards(algorithms, onSelect) {
  const wrap = $("algo-cards");
  wrap.innerHTML = "";
  for (const algo of Object.values(algorithms)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "algo-card";
    btn.dataset.id = algo.id;
    btn.innerHTML = `${algo.name}<span class="algo-ops">mide: ${algo.opsLabel}</span>`;
    btn.addEventListener("click", () => {
      wrap.querySelectorAll(".algo-card").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onSelect(algo.id);
    });
    wrap.appendChild(btn);
  }
}

export function markActiveAlgo(algoId) {
  document.querySelectorAll(".algo-card").forEach((b) => {
    b.classList.toggle("active", b.dataset.id === algoId);
  });
}

export function fillParams({ n0, h, N, reps }) {
  $("p-n0").value = n0;
  $("p-h").value = h;
  $("p-N").value = N;
  $("p-reps").value = reps;
}

export function readParams() {
  const read = (id, label) => {
    const v = Number($(id).value);
    if (!Number.isFinite(v) || v <= 0 || !Number.isInteger(v)) {
      throw new Error(`Parámetro inválido: ${label} debe ser un entero > 0`);
    }
    return v;
  };
  const params = {
    n0: read("p-n0", "n₀"),
    h: read("p-h", "h"),
    N: read("p-N", "N"),
    reps: read("p-reps", "repeticiones"),
  };
  if (params.N < 5 || params.N > 12) throw new Error("N debe estar entre 5 y 12");
  if (params.reps > 31) throw new Error("repeticiones: máximo 31");
  return params;
}

export function setRunning(running) {
  $("btn-run").disabled = running;
  $("run-sub").textContent = running ? "midiendo en worker…" : "worker en espera";
  $("progress").classList.toggle("hidden", !running);
  if (running) setProgress({ index: 0, total: 1, n: null });
}

export function setProgress({ index, total, n }) {
  $("progress-fill").style.width = `${Math.round((100 * index) / total)}%`;
  $("progress-text").textContent = n === null ? `${index}/${total}` : `n=${fmt(n)} (${index + 1}/${total})`;
}

export function showError(msg) {
  const el = $("error-banner");
  el.textContent = `▲ ${msg}`;
  el.classList.remove("hidden");
}

export function clearError() {
  $("error-banner").classList.add("hidden");
}

// ---------- fórmulas KaTeX ----------

export function renderHeroFormula() {
  katex.render(
    String.raw`\varphi'(x_0)=\frac{1}{h}\Big[\Delta f(x_0)-\tfrac{1}{2}\Delta^2 f(x_0)+\tfrac{1}{3}\Delta^3 f(x_0)-\dots+\tfrac{(-1)^{n-1}}{n}\Delta^n f(x_0)\Big]`,
    $("hero-formula"),
    { throwOnError: false }
  );
}

function renderSubstitutedFormula(el, { n0, h, terms, est }) {
  const body = terms
    .map((v, i) => {
      const k = i + 1;
      const num = fmtLatex(v);
      if (k === 1) return num;
      const sign = k % 2 === 0 ? "-" : "+";
      return String.raw`${sign}\tfrac{${num}}{${k}}`;
    })
    .join(" ");
  katex.render(
    String.raw`\varphi'(${n0})=\frac{1}{${h}}\Big[${body}\Big]=${fmtLatex(est)}`,
    el,
    { throwOnError: false }
  );
}

// ---------- resultados ----------

let lastState = null;
let activeMetric = "ops";

export function setupTableTabs() {
  $("tab-ops").addEventListener("click", () => switchMetric("ops"));
  $("tab-time").addEventListener("click", () => switchMetric("time"));
}

function switchMetric(metric) {
  activeMetric = metric;
  $("tab-ops").classList.toggle("active", metric === "ops");
  $("tab-time").classList.toggle("active", metric === "time");
  if (lastState) renderDiffTable(lastState);
}

function relSpreadPct(col) {
  const mean = col.reduce((a, b) => a + b, 0) / col.length;
  if (Math.abs(mean) < 1e-300) return null;
  return (100 * (Math.max(...col) - Math.min(...col))) / Math.abs(mean);
}

function renderDiffTable(state) {
  const { ns, ops, timesMs, tableOps, tableTime, clsOps, clsTime } = state;
  const isOps = activeMetric === "ops";
  const table = isOps ? tableOps : tableTime;
  const values = isOps ? ops : timesMs;
  const stableK = isOps ? clsOps.degree : clsTime.degree;
  const maxK = Math.min(4, table.length - 1);

  let html = "<thead><tr><th>n</th><th>T(n)</th>";
  for (let k = 1; k <= maxK; k++) {
    const spread = relSpreadPct(table[k]);
    const cls = k === stableK ? ' class="stable-col"' : "";
    html += `<th${cls}>Δ${"⁰¹²³⁴"[k]}T<span class="col-spread">disp ${
      spread === null ? "—" : fmt(spread) + " %"
    }</span></th>`;
  }
  html += "</tr></thead><tbody>";
  for (let i = 0; i < ns.length; i++) {
    html += `<tr><td>${fmt(ns[i])}</td><td>${fmt(values[i])}</td>`;
    for (let k = 1; k <= maxK; k++) {
      const v = table[k][i];
      const cls = k === stableK ? ' class="stable-col"' : "";
      html += `<td${cls}>${v === undefined ? "" : fmt(v)}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody>";
  $("diff-table").innerHTML = html;

  $("table-footnote").textContent = isOps
    ? "Métrica determinista: la columna resaltada se estabiliza y delata el grado del polinomio. disp = (max − min) / |media| de la columna."
    : "Métrica con ruido de medición: observá cómo el ruido se amplifica en las columnas de orden alto — ese es el término de error ε'(x₀) del método en acción.";
}

export function renderResults(state) {
  lastState = state;
  $("results-empty").classList.add("hidden");
  const body = $("results-body");
  body.classList.remove("hidden");
  // re-disparar animación de entrada
  body.querySelectorAll(".reveal").forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });

  const { algo, clsOps, clsTime, deriv } = state;

  // veredicto
  $("verdict-bigo").textContent = clsOps.bigO;
  const match = $("verdict-match");
  if (clsOps.bigO === algo.bigO) {
    match.textContent = `✓ COINCIDE CON EL MODELO TEÓRICO (${algo.bigO})`;
    match.className = "verdict-match match";
  } else {
    match.textContent = `✗ MODELO TEÓRICO: ${algo.bigO}`;
    match.className = "verdict-match mismatch";
  }
  $("verdict-why").textContent = clsOps.justification;
  $("verdict-time").innerHTML =
    `Con la métrica de <span class="warn">tiempo</span> (ruidosa): ` +
    `<span class="mono warn">${clsTime.bigO}</span> — ${clsTime.justification}`;

  // derivada
  renderSubstitutedFormula($("deriv-formula"), deriv);
  $("deriv-est").textContent = fmt(deriv.est);
  $("deriv-model").textContent = fmt(deriv.model);
  $("deriv-model-label").textContent = `modelo ${algo.modelLabel}${algo.modelExact ? "" : " (aprox.)"} en n₀`;
  $("deriv-err").textContent = deriv.errPct === null ? "—" : `${fmt(deriv.errPct)} %`;
  $("deriv-err").classList.toggle("ok", deriv.errPct !== null && deriv.errPct < 1);

  // tabla (métrica activa actual)
  renderDiffTable(state);
}
