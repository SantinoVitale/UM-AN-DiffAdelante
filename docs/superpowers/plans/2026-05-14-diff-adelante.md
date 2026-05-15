# Diferencias hacia adelante — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una calculadora interactiva en HTML/CSS/JS que aplica la fórmula de diferencias hacia adelante para derivar f(x) en x₀, con dos modos de entrada (función o puntos manuales), tabla Δ, derivada analítica vs aproximada, gráfico con tangente y dos ejemplos precargables del PDF.

**Architecture:** Sitio estático sin build step. Tres libs por CDN (`math.js`, `Chart.js`, `KaTeX`) cargadas como globals. Mi código en módulos ES nativos importados desde `js/main.js`. Funciones puras en `calc.js`/`expr.js`; helpers DOM y plot en `ui.js`/`plot.js`. Estilo dark/neon en `css/style.css`, conservando el rule `.rainbow-title` existente.

**Tech Stack:** HTML5, CSS3, JS (ESM nativo), math.js@13, Chart.js@4, KaTeX@0.16.

**Nota sobre commits:** El usuario commitea él mismo. Cada vez que se ve un paso "Commit", es manual — el executor deja los cambios listos y le da al usuario el comando sugerido como referencia, sin ejecutar `git`.

---

## File Structure

| Archivo | Responsabilidad | Estado |
|---------|-----------------|--------|
| `index.html` | Shell, CDN tags, layout de tabs/inputs/results | Reescribir |
| `css/style.css` | Theme dark/neon + layout + preservar `.rainbow-title` | Reescribir preservando rule |
| `js/main.js` | Entrada ESM, wiring listeners, función `calculate()` | Crear |
| `js/calc.js` | Puro: `buildDiffTable`, `forwardDerivativeAtX0`, `relativeErrorPct` | Crear |
| `js/expr.js` | Wrapper math.js: `parseExpr`, `buildPointsFromFunction` | Crear |
| `js/ui.js` | DOM: tabs, render tabla, render KaTeX, banner error, validate, readInputs, ejemplos | Crear |
| `js/plot.js` | Chart.js: render curva + scatter + tangente | Crear |
| `js/index.js` | Vacío, ya no se usa | Borrar |

---

## Task 1: HTML shell + CDN + layout

**Files:**
- Modify: `index.html` (reescribir completo)

- [x] **Step 1: Reescribir `index.html` con shell, CDN tags y layout completo**

Reemplazar el contenido entero de `index.html` por:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UM - AN - Diferencia Hacia Adelante</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/mathjs@13.2.0/lib/browser/math.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.5/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
</head>
<body>
  <div class="container">
    <h1 class="rainbow-title">El EPICO PROYECTO DEL DUO DINAMICO</h1>
    <p class="subtitle">Diferencias hacia adelante</p>

    <div class="tabs">
      <button class="tab active" data-tab="function">Función f(x)</button>
      <button class="tab" data-tab="manual">Puntos manuales</button>
    </div>

    <div class="panel active" data-panel="function">
      <div class="row">
        <label>f(x) = <input type="text" id="fn-expr" placeholder="exp(x) + x" style="width: 16rem;"></label>
      </div>
      <div class="row">
        <label>x₀ <input type="number" id="fn-x0" step="any" value="0.5" style="width: 6rem;"></label>
        <label>h <input type="number" id="fn-h" step="any" value="0.01" style="width: 6rem;"></label>
        <label>n
          <select id="fn-n">
            <option>1</option><option>2</option><option>3</option><option selected>4</option>
          </select>
        </label>
        <label>N <input type="number" id="fn-N" min="2" step="1" value="5" style="width: 6rem;"></label>
      </div>
      <div class="row">
        <button id="fn-calc">Calcular</button>
        <button class="ghost" id="fn-load-p5">Cargar ejemplo Problema 5</button>
      </div>
    </div>

    <div class="panel" data-panel="manual">
      <div class="row">
        <label>x₀ <input type="number" id="mn-x0" step="any" value="0" style="width: 6rem;"></label>
        <label>h <input type="number" id="mn-h" step="any" value="0.006" style="width: 6rem;"></label>
        <label>n
          <select id="mn-n">
            <option>1</option><option>2</option><option>3</option><option selected>4</option>
          </select>
        </label>
      </div>
      <div id="manual-y-list"></div>
      <div class="row">
        <button class="ghost" id="mn-add-row">+ fila</button>
        <button class="ghost" id="mn-remove-row">– fila</button>
      </div>
      <div class="row">
        <button id="mn-calc">Calcular</button>
        <button class="ghost" id="mn-load-p4">Cargar ejemplo Problema 4</button>
      </div>
    </div>

    <div id="error-banner" class="error-banner hidden"></div>

    <div class="results">
      <h2>Resultados</h2>
      <div id="formula"></div>
      <div>φ'(x₀) = <span id="phi-prime" class="big-num"></span></div>
      <div id="analytic-block" class="hidden">
        <div>f'(x₀) = <span id="f-prime"></span></div>
        <div id="err-pct"></div>
      </div>
      <div id="diff-table"></div>
      <div id="chart-wrap" class="hidden">
        <canvas id="chart"></canvas>
      </div>
    </div>
  </div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [x] **Step 2: Verificación visual**

Abrir `index.html` en navegador. Esperado: título rainbow visible, subtítulo "Diferencias hacia adelante", dos tabs ("Función f(x)" activa por defecto, "Puntos manuales" inactiva), inputs vacíos del modo función visibles, botones "Calcular" y "Cargar ejemplo Problema 5" presentes. Consola del navegador: **un solo error esperado** — `GET js/main.js 404` porque todavía no existe. Nada más.

- [x] **Step 3: Commit manual**

```
git add index.html
git commit -m "feat: HTML shell con CDN tags, tabs y layout de inputs"
```

---

## Task 2: CSS dark/neon preservando rainbow

**Files:**
- Modify: `css/style.css` (preservar las líneas 1–25 existentes, agregar theme abajo)

- [x] **Step 1: Reescribir `css/style.css` manteniendo el rule rainbow**

Reemplazar el contenido completo por:

```css
.rainbow-title {
	background: linear-gradient(
		90deg,
		#ff4d4d,
		#ffa64d,
		#ffff4d,
		#4dff4d,
		#4dd2ff,
		#4d4dff,
		#b84dff,
		#ff4d4d
	);
	background-size: 300% 100%;
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	animation: rainbow-shift 6s linear infinite;
	text-align: center;
	font-size: 2.2rem;
	margin: 0;
}

@keyframes rainbow-shift {
	0% { background-position: 0% 50%; }
	100% { background-position: 100% 50%; }
}

:root {
  --bg: #0a0f1e;
  --bg-2: #111827;
  --bg-3: #1e293b;
  --fg: #cbd5e1;
  --fg-dim: #94a3b8;
  --cyan: #22d3ee;
  --violet: #a78bfa;
  --pink: #f472b6;
  --red: #ef4444;
  --mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--mono);
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.subtitle {
  color: var(--cyan);
  text-align: center;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-top: 0.5rem;
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
  border-bottom: 1px solid var(--bg-3);
}

.tab {
  background: transparent;
  border: none;
  color: var(--fg-dim);
  font-family: var(--mono);
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.tab.active {
  color: var(--cyan);
  border-bottom-color: var(--cyan);
}

.panel { display: none; padding: 1.5rem 0; }
.panel.active { display: block; }

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

label {
  color: var(--fg-dim);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

input[type="text"], input[type="number"], select {
  background: var(--bg-2);
  border: 1px solid var(--bg-3);
  color: var(--fg);
  font-family: var(--mono);
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

button {
  background: var(--violet);
  color: white;
  border: none;
  font-family: var(--mono);
  font-size: 0.95rem;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
  transition: filter 0.2s, transform 0.05s;
}

button:hover { filter: brightness(1.15); }
button:active { transform: scale(0.98); }

button.ghost {
  background: transparent;
  border: 1px solid var(--bg-3);
  color: var(--fg);
}

button.ghost:hover { border-color: var(--violet); }

.error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid var(--red);
  color: var(--red);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.hidden { display: none !important; }

.results {
  margin-top: 2rem;
  background: var(--bg-2);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--bg-3);
}

.results h2 {
  color: var(--cyan);
  margin-top: 0;
}

#formula {
  margin: 1rem 0;
  text-align: center;
}

.big-num {
  font-size: 2rem;
  color: var(--cyan);
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
  margin: 0.5rem 0;
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.diff-table th, .diff-table td {
  padding: 0.4rem 0.6rem;
  text-align: right;
  border: 1px solid var(--bg-3);
}

.diff-table th {
  background: var(--bg-3);
  color: var(--violet);
}

.diff-table tbody tr:hover {
  background: rgba(34, 211, 238, 0.05);
}

.y-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.4rem;
}

.y-row input { width: 12rem; }
.y-row label { min-width: 3rem; }

#chart-wrap {
  margin-top: 2rem;
  height: 400px;
  background: var(--bg-2);
  padding: 1rem;
  border-radius: 8px;
  position: relative;
}
```

- [x] **Step 2: Verificación visual**

Recargar `index.html`. Esperado: fondo oscuro azul-negro, título rainbow centrado y animado, subtítulo cyan con glow, tabs cyan/grises, inputs oscuros con borde cyan al focus, botones violetas, panel de resultados con border en gris oscuro. Layout limpio sin choques. Consola: solo el 404 de `js/main.js` esperado.

- [x] **Step 3: Commit manual**

```
git add css/style.css
git commit -m "style: dark/neon theme preservando rainbow-title"
```

---

## Task 3: `calc.js` — lógica núcleo pura

**Files:**
- Create: `js/calc.js`

- [x] **Step 1: Crear `js/calc.js`**

```js
export function buildDiffTable(ys) {
  if (!Array.isArray(ys) || ys.length === 0) {
    throw new Error("ys vacío o no es array");
  }
  const table = [ys.slice()];
  for (let k = 1; k < ys.length; k++) {
    const prev = table[k - 1];
    if (prev.length < 2) break;
    const next = [];
    for (let j = 0; j < prev.length - 1; j++) {
      next.push(prev[j + 1] - prev[j]);
    }
    table.push(next);
  }
  return table;
}

export function forwardDerivativeAtX0(diffTable, h, n) {
  if (!Number.isFinite(h) || h <= 0) throw new Error("h debe ser > 0");
  if (!Number.isInteger(n) || n < 1) throw new Error("n debe ser entero >= 1");
  let sum = 0;
  for (let k = 1; k <= n; k++) {
    if (!diffTable[k] || diffTable[k].length === 0) {
      throw new Error(`No hay datos para Δ^${k} f(x0). Necesitás al menos ${k + 1} puntos.`);
    }
    const deltaK_at_0 = diffTable[k][0];
    const sign = (k % 2 === 1) ? 1 : -1;
    sum += sign * deltaK_at_0 / k;
  }
  return sum / h;
}

export function relativeErrorPct(approx, exact) {
  if (!Number.isFinite(approx) || !Number.isFinite(exact)) return null;
  if (Math.abs(exact) < 1e-12) return null;
  return 100 * Math.abs(approx - exact) / Math.abs(exact);
}
```

- [x] **Step 2: Verificación inline en consola del navegador**

Abrir `index.html`, abrir DevTools → Console, pegar:

```js
const m = await import('./js/calc.js');
const ys = [0, 0.899, 1.915, 3.048, 4.299];
const t = m.buildDiffTable(ys);
console.log('Δ¹:', t[1]);   // [0.899, 1.016, 1.133, 1.251]
console.log('Δ²:', t[2]);   // [0.117, 0.117, 0.118]
console.log('Δ³:', t[3]);   // [0, 0.001]
console.log('Δ⁴:', t[4]);   // [0.001]
console.log('φ\'(0) =', m.forwardDerivativeAtX0(t, 0.006, 4));
// Esperado: ≈ 140.0417
```

Esperado: el último `console.log` da `≈ 140.0417` (margen de redondeo 4 decimales). Si difiere de 140.04 hay bug en `buildDiffTable` o en la fórmula.

- [x] **Step 3: Commit manual**

```
git add js/calc.js
git commit -m "feat(calc): buildDiffTable, forwardDerivativeAtX0, relativeErrorPct"
```

---

## Task 4: `expr.js` — wrapper math.js

**Files:**
- Create: `js/expr.js`

- [x] **Step 1: Crear `js/expr.js`**

```js
// math.js viene como global desde el CDN

export function parseExpr(fStr) {
  if (!fStr || !fStr.trim()) throw new Error("expresión vacía");
  const node = math.parse(fStr);
  const fCompiled = node.compile();

  let dCompiled = null;
  try {
    const derivNode = math.derivative(node, 'x');
    dCompiled = derivNode.compile();
  } catch (e) {
    dCompiled = null;
  }

  return {
    eval(x) {
      const v = fCompiled.evaluate({ x });
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        throw new Error(`f(${x}) = ${v} (no finito)`);
      }
      return v;
    },
    derivEval(x) {
      if (dCompiled) {
        const v = dCompiled.evaluate({ x });
        if (Number.isFinite(v)) return { value: v, method: 'symbolic' };
      }
      const hh = 1e-6;
      const v = (fCompiled.evaluate({ x: x + hh }) - fCompiled.evaluate({ x: x - hh })) / (2 * hh);
      return { value: v, method: 'numeric' };
    }
  };
}

export function buildPointsFromFunction(fStr, x0, h, N) {
  const expr = parseExpr(fStr);
  const xs = [];
  const ys = [];
  for (let i = 0; i < N; i++) {
    const x = x0 + i * h;
    xs.push(x);
    ys.push(expr.eval(x));
  }
  return { xs, ys, expr };
}
```

- [x] **Step 2: Verificación inline en consola**

Recargar `index.html`, DevTools Console:

```js
const e = await import('./js/expr.js');
const { xs, ys, expr } = e.buildPointsFromFunction('exp(x) + x', 0.5, 0.01, 5);
console.log('xs:', xs);  // [0.5, 0.51, 0.52, 0.53, 0.54]
console.log('ys[0]:', ys[0]);  // ≈ 2.148721
console.log('f\'(0.5) =', expr.derivEval(0.5));
// Esperado: { value: ≈ 2.648721, method: 'symbolic' }
```

Esperado: `value` ≈ 2.6487 con `method: 'symbolic'`. Si dice `numeric` significa que `math.derivative` falló — ver mensaje en consola e investigar.

- [x] **Step 3: Commit manual**

```
git add js/expr.js
git commit -m "feat(expr): wrapper math.js con parseExpr y derivada simbólica"
```

---

## Task 5: `ui.js` — DOM helpers

**Files:**
- Create: `js/ui.js`

- [ ] **Step 1: Crear `js/ui.js`**

```js
// katex viene como global desde el CDN

export function setupTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    const target = t.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(x =>
      x.classList.toggle('active', x === t)
    );
    document.querySelectorAll('[data-panel]').forEach(p =>
      p.classList.toggle('active', p.dataset.panel === target)
    );
  }));
}

function makeYRow(idx) {
  const div = document.createElement('div');
  div.setAttribute('data-y-row', idx);
  div.className = 'y-row';
  div.innerHTML = `<label>y<sub>${idx}</sub></label><input type="number" step="any">`;
  return div;
}

export function setupManualRows() {
  const list = document.getElementById('manual-y-list');
  document.getElementById('mn-add-row').addEventListener('click', () => {
    list.appendChild(makeYRow(list.children.length));
  });
  document.getElementById('mn-remove-row').addEventListener('click', () => {
    if (list.children.length > 2) list.removeChild(list.lastChild);
  });
  // Filas iniciales: 5
  for (let i = 0; i < 5; i++) list.appendChild(makeYRow(i));
}

export function showError(msg) {
  const banner = document.getElementById('error-banner');
  banner.textContent = msg;
  banner.classList.remove('hidden');
}

export function clearError() {
  const banner = document.getElementById('error-banner');
  banner.textContent = '';
  banner.classList.add('hidden');
}

export function readInputs() {
  const activePanel = document.querySelector('[data-panel].active').dataset.panel;
  if (activePanel === 'function') {
    return {
      mode: 'function',
      fStr: document.getElementById('fn-expr').value.trim(),
      x0: parseFloat(document.getElementById('fn-x0').value),
      h: parseFloat(document.getElementById('fn-h').value),
      n: parseInt(document.getElementById('fn-n').value, 10),
      N: parseInt(document.getElementById('fn-N').value, 10),
    };
  } else {
    const yInputs = document.querySelectorAll('[data-y-row] input');
    const ysManual = Array.from(yInputs).map(i => parseFloat(i.value));
    return {
      mode: 'manual',
      x0: parseFloat(document.getElementById('mn-x0').value),
      h: parseFloat(document.getElementById('mn-h').value),
      n: parseInt(document.getElementById('mn-n').value, 10),
      ysManual,
    };
  }
}

export function validate(inputs) {
  const errors = [];
  const { mode, x0, h, n } = inputs;
  if (!Number.isFinite(h) || h <= 0) errors.push("h debe ser > 0");
  if (!Number.isFinite(x0)) errors.push("x₀ debe ser numérico");
  if (!Number.isInteger(n) || n < 1 || n > 4) errors.push("n debe ser entero en [1, 4]");
  if (mode === 'function') {
    if (!Number.isInteger(inputs.N) || inputs.N < n + 1) {
      errors.push(`N debe ser entero ≥ n+1 (= ${n + 1})`);
    }
    if (!inputs.fStr) errors.push("f(x) vacía");
  } else {
    const ys = inputs.ysManual;
    if (!Array.isArray(ys) || ys.length < n + 1) {
      errors.push(`Faltan filas: necesito al menos n+1 = ${n + 1}`);
    } else {
      const bad = ys.findIndex(v => !Number.isFinite(v));
      if (bad >= 0) errors.push(`y${bad} no es numérico`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function renderDiffTable(table, xs) {
  const container = document.getElementById('diff-table');
  const maxOrder = table.length - 1;
  let html = '<table class="diff-table"><thead><tr><th>i</th><th>x</th><th>f(x)</th>';
  for (let k = 1; k <= maxOrder; k++) html += `<th>Δ<sup>${k}</sup>f</th>`;
  html += '</tr></thead><tbody>';
  for (let i = 0; i < xs.length; i++) {
    html += `<tr><td>${i}</td><td>${formatNum(xs[i])}</td>`;
    for (let k = 0; k <= maxOrder; k++) {
      const val = table[k]?.[i];
      html += `<td>${val !== undefined ? formatNum(val) : ''}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

function formatNum(v) {
  if (!Number.isFinite(v)) return String(v);
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e6 || abs < 1e-4) return v.toExponential(4);
  return v.toPrecision(6);
}

export function renderFormulaKaTeX(n) {
  const target = document.getElementById('formula');
  let tex = "\\varphi'(x_0) = \\frac{1}{h}\\left[";
  for (let k = 1; k <= n; k++) {
    if (k === 1) {
      tex += "\\Delta f(x_0)";
    } else {
      const sign = (k % 2 === 1) ? '+' : '-';
      tex += ` ${sign} \\frac{1}{${k}}\\Delta^{${k}}f(x_0)`;
    }
  }
  tex += "\\right]";
  katex.render(tex, target, { throwOnError: false, displayMode: true });
}

export function renderResultsNumbers({ approx, analytic, errPct, method }) {
  document.getElementById('phi-prime').textContent = formatNum(approx);
  const block = document.getElementById('analytic-block');
  if (analytic === null || analytic === undefined) {
    block.classList.add('hidden');
    return;
  }
  block.classList.remove('hidden');
  const suffix = method === 'numeric' ? ' (aprox numérica)' : '';
  document.getElementById('f-prime').textContent = formatNum(analytic) + suffix;
  const errEl = document.getElementById('err-pct');
  if (errPct === null) {
    errEl.textContent = `error abs = ${Math.abs(approx - analytic).toExponential(3)}`;
  } else {
    errEl.textContent = `error = ${errPct.toExponential(3)} %`;
  }
}

export function loadExampleProblema4() {
  document.querySelector('[data-tab="manual"]').click();
  document.getElementById('mn-x0').value = '0';
  document.getElementById('mn-h').value = '0.006';
  document.getElementById('mn-n').value = '4';
  const ys = [0, 0.899, 1.915, 3.048, 4.299];
  const list = document.getElementById('manual-y-list');
  list.innerHTML = '';
  ys.forEach((y, i) => {
    const row = makeYRow(i);
    row.querySelector('input').value = y;
    list.appendChild(row);
  });
}

export function loadExampleProblema5() {
  document.querySelector('[data-tab="function"]').click();
  document.getElementById('fn-expr').value = 'exp(x) + x';
  document.getElementById('fn-x0').value = '0.5';
  document.getElementById('fn-h').value = '0.01';
  document.getElementById('fn-n').value = '4';
  document.getElementById('fn-N').value = '5';
}
```

- [ ] **Step 2: Commit manual** (verificación visual completa viene en Task 6, este task aún no se wirea)

```
git add js/ui.js
git commit -m "feat(ui): tabs, validate, render tabla y fórmula KaTeX, ejemplos"
```

---

## Task 6: `main.js` wiring + verificación Problema 4 (sin plot)

**Files:**
- Create: `js/main.js`
- Delete: `js/index.js` (vacío, ya no se usa)

- [ ] **Step 1: Borrar `js/index.js`**

```bash
rm js/index.js
```

- [ ] **Step 2: Crear `js/main.js`**

```js
import { buildDiffTable, forwardDerivativeAtX0, relativeErrorPct } from './calc.js';
import { buildPointsFromFunction } from './expr.js';
import {
  setupTabs, setupManualRows,
  showError, clearError,
  readInputs, validate,
  renderDiffTable, renderFormulaKaTeX, renderResultsNumbers,
  loadExampleProblema4, loadExampleProblema5,
} from './ui.js';

function calculate() {
  clearError();

  const inputs = readInputs();
  const { ok, errors } = validate(inputs);
  if (!ok) {
    showError(errors.join(' | '));
    return;
  }

  const { mode, x0, h, n } = inputs;
  let xs, ys, expr = null;

  try {
    if (mode === 'function') {
      const r = buildPointsFromFunction(inputs.fStr, x0, h, inputs.N);
      xs = r.xs; ys = r.ys; expr = r.expr;
    } else {
      ys = inputs.ysManual;
      xs = ys.map((_, i) => x0 + i * h);
    }
  } catch (e) {
    showError(`Error armando puntos: ${e.message}`);
    return;
  }

  let table, approx;
  try {
    table = buildDiffTable(ys);
    approx = forwardDerivativeAtX0(table, h, n);
  } catch (e) {
    showError(e.message);
    return;
  }

  renderFormulaKaTeX(n);
  renderDiffTable(table, xs);

  let analytic = null, errPct = null, method = null;
  if (mode === 'function' && expr) {
    try {
      const d = expr.derivEval(x0);
      analytic = d.value;
      method = d.method;
      errPct = relativeErrorPct(approx, analytic);
    } catch (e) {
      analytic = null;
    }
  }
  renderResultsNumbers({ approx, analytic, errPct, method });

  // Chart se wirea en Task 7
  document.getElementById('chart-wrap').classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupManualRows();
  document.getElementById('fn-calc').addEventListener('click', calculate);
  document.getElementById('mn-calc').addEventListener('click', calculate);
  document.getElementById('fn-load-p5').addEventListener('click', loadExampleProblema5);
  document.getElementById('mn-load-p4').addEventListener('click', loadExampleProblema4);
});
```

- [ ] **Step 3: Verificación Problema 4 (modo manual)**

Abrir `index.html`. Esperado:
1. Sin error 404 en consola.
2. Click "Puntos manuales" → tab cambia, panel manual aparece, 5 filas y₀..y₄ con inputs vacíos.
3. Click "Cargar ejemplo Problema 4" → inputs se llenan (x₀=0, h=0.006, n=4, y₀=0, y₁=0.899, y₂=1.915, y₃=3.048, y₄=4.299).
4. Click "Calcular":
   - Fórmula KaTeX visible: `φ'(x₀) = (1/h)[Δf(x₀) - (1/2)Δ²f(x₀) + (1/3)Δ³f(x₀) - (1/4)Δ⁴f(x₀)]`
   - `φ'(x₀) = 140.042` (o similar, 6 dígitos de precisión, ≈ 140.0417 del PDF)
   - Tabla de diferencias con columnas Δ¹, Δ², Δ³, Δ⁴.
   - Bloque "f'(x₀)" oculto (modo manual, sin función).
   - Chart oculto.

Si `φ'(x₀)` no da ≈ 140.04 → revisar Task 3 (calc.js).

- [ ] **Step 4: Verificación Problema 5 (modo función)**

Click "Función f(x)" → tab cambia. Click "Cargar ejemplo Problema 5" → inputs llenan. Click "Calcular":
- `φ'(x₀) ≈ 2.6487`
- `f'(x₀) ≈ 2.6487`
- `error ≈ 4.054e-6 %` (debería estar entre 1e-7 y 1e-5)

Si el error es mucho mayor que 1e-5 % → bug en `expr.derivEval` o el formato del número. Si dice "(aprox numérica)" → `math.derivative` falló, investigar.

- [ ] **Step 5: Verificación errores**

Sin tocar nada, ir a modo función, vaciar el campo "f(x)" y click Calcular. Esperado: banner rojo "f(x) vacía". Llenar f(x) con `1/0` y Calcular: banner "Error armando puntos: f(0.5) = Infinity (no finito)" o similar. Llenar correctamente y Calcular: banner desaparece, resultado se muestra.

- [ ] **Step 6: Commit manual**

```
git add js/main.js
git rm js/index.js
git commit -m "feat(main): wiring calculate, listeners y ejemplos precargados"
```

---

## Task 7: `plot.js` + integración chart en modo función

**Files:**
- Create: `js/plot.js`
- Modify: `js/main.js` (agregar wiring del chart)

- [ ] **Step 1: Crear `js/plot.js`**

```js
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
```

- [ ] **Step 2: Modificar `js/main.js` para wirear el chart**

Agregar el import al principio:

```js
import { renderPlot, destroyPlot } from './plot.js';
```

Reemplazar las dos últimas líneas de `calculate()` (la parte que ahora dice `// Chart se wirea en Task 7` y `classList.add('hidden')`) por:

```js
  if (mode === 'function' && expr) {
    renderPlot('chart', expr, xs, x0, approx);
    document.getElementById('chart-wrap').classList.remove('hidden');
  } else {
    destroyPlot();
    document.getElementById('chart-wrap').classList.add('hidden');
  }
```

Resultado final de `calculate()`:

```js
function calculate() {
  clearError();

  const inputs = readInputs();
  const { ok, errors } = validate(inputs);
  if (!ok) {
    showError(errors.join(' | '));
    return;
  }

  const { mode, x0, h, n } = inputs;
  let xs, ys, expr = null;

  try {
    if (mode === 'function') {
      const r = buildPointsFromFunction(inputs.fStr, x0, h, inputs.N);
      xs = r.xs; ys = r.ys; expr = r.expr;
    } else {
      ys = inputs.ysManual;
      xs = ys.map((_, i) => x0 + i * h);
    }
  } catch (e) {
    showError(`Error armando puntos: ${e.message}`);
    return;
  }

  let table, approx;
  try {
    table = buildDiffTable(ys);
    approx = forwardDerivativeAtX0(table, h, n);
  } catch (e) {
    showError(e.message);
    return;
  }

  renderFormulaKaTeX(n);
  renderDiffTable(table, xs);

  let analytic = null, errPct = null, method = null;
  if (mode === 'function' && expr) {
    try {
      const d = expr.derivEval(x0);
      analytic = d.value;
      method = d.method;
      errPct = relativeErrorPct(approx, analytic);
    } catch (e) {
      analytic = null;
    }
  }
  renderResultsNumbers({ approx, analytic, errPct, method });

  if (mode === 'function' && expr) {
    renderPlot('chart', expr, xs, x0, approx);
    document.getElementById('chart-wrap').classList.remove('hidden');
  } else {
    destroyPlot();
    document.getElementById('chart-wrap').classList.add('hidden');
  }
}
```

- [ ] **Step 3: Verificación visual del chart**

Recargar `index.html`. Click "Cargar ejemplo Problema 5" → "Calcular". Esperado:
- Resultado φ'(0.5) ≈ 2.6487 como antes.
- Chart visible debajo de la tabla: curva cyan creciente (es exp(x)+x), 5 puntos violetas marcados en el rango 0.5–0.54, línea rosa punteada que pasa por (0.5, e^0.5+0.5) con pendiente ≈ 2.6487.
- Tangente debería verse claramente próxima a la curva (pendientes casi idénticas — la tangente y f(x) prácticamente coinciden en este rango chico).

Volver a "Puntos manuales", cargar Problema 4, Calcular. Esperado: chart se oculta (no hay función en modo manual).

- [ ] **Step 4: Commit manual**

```
git add js/plot.js js/main.js
git commit -m "feat(plot): Chart.js con curva, puntos y tangente"
```

---

## Task 8: Pulido visual y micro-detalles

**Files:**
- Modify: `css/style.css` (agregar refinamientos al final)

- [ ] **Step 1: Agregar al final de `css/style.css`**

```css
/* Refinamientos visuales */
.results { animation: fade-in 0.3s ease-out; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.big-num { transition: text-shadow 0.3s; }

.tab:hover { color: var(--fg); }
.tab.active:hover { color: var(--cyan); }

.error-banner { animation: shake 0.4s; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Responsive básico */
@media (max-width: 720px) {
  body { padding: 1rem; }
  .rainbow-title { font-size: 1.6rem; }
  .row { flex-direction: column; align-items: stretch; }
  .row label { width: 100%; }
  .row label input, .row label select { width: 100% !important; }
  .diff-table { font-size: 0.75rem; }
  .diff-table th, .diff-table td { padding: 0.25rem 0.35rem; }
  #chart-wrap { height: 300px; }
}

/* Scrollbar dark */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--bg-2); }
::-webkit-scrollbar-thumb { background: var(--bg-3); border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: var(--violet); }
```

- [ ] **Step 2: Verificación visual**

Recargar. Esperado:
- Al click Calcular, el bloque resultados aparece con fade-in suave.
- Al pegar un error (e.g. f(x) vacía), el banner rojo "tiembla" brevemente.
- Reducir ventana a < 720px de ancho: layout colapsa a columna, tabla de Δ se achica, título rainbow más chico.
- Scrollbar oscura.

- [ ] **Step 3: Commit manual**

```
git add css/style.css
git commit -m "polish: animaciones sutiles, responsive y scrollbar dark"
```

---

## Task 9: Verificación final integral

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Checklist Problema 4 end-to-end**

Recargar `index.html`. Pestaña Puntos manuales → "Cargar ejemplo Problema 4" → "Calcular":

- [ ] φ'(x₀) ≈ 140.042 (PDF: 140.041667)
- [ ] Tabla muestra Δ¹ = [0.899, 1.016, 1.133, 1.251], Δ² ≈ [0.117, 0.117, 0.118], Δ³ ≈ [0, 0.001], Δ⁴ ≈ [0.001]
- [ ] No aparece bloque "f'(x₀)" ni chart
- [ ] Fórmula KaTeX renderizada con n=4

- [ ] **Step 2: Checklist Problema 5 end-to-end**

Pestaña Función f(x) → "Cargar ejemplo Problema 5" → "Calcular":

- [ ] φ'(x₀) ≈ 2.6487
- [ ] f'(x₀) ≈ 2.6487 (sin marca "aprox numérica")
- [ ] error ≈ 4.05e-6 % (entre 1e-7 y 1e-5)
- [ ] Chart visible con curva exp(x)+x creciente, 5 puntos resaltados, tangente rosa punteada
- [ ] Tabla Δ visible

- [ ] **Step 3: Checklist robustez**

Tests manuales rápidos en modo función:

- [ ] f(x) = `sin(x)` con x₀=0, h=0.01, N=5, n=4 → φ'(0) ≈ 1, error < 1e-4 %
- [ ] f(x) = `1/(x-0.5)` con x₀=0.5 → banner de error "f no definida en x = 0.5"
- [ ] f(x) = `qwerty` (inválida) → banner "Expresión inválida: ..."
- [ ] h = 0 → banner "h debe ser > 0"
- [ ] Cambiar n a 1 con N=5 → fórmula KaTeX se actualiza al recalcular (solo Δf, sin sumandos)

- [ ] **Step 4: Commit manual final**

Si todo OK y querés marcar el milestone:

```
git commit --allow-empty -m "verify: Problemas 4 y 5 del PDF reproducidos correctamente"
```

(Opcional. Si no querés commit vacío, omitir.)

---

## Self-Review (post escritura)

**Spec coverage check:**

| Spec section | Task que la cubre |
|--------------|-------------------|
| §2 Alcance: modo función | Task 1 (HTML), Task 4 (expr), Task 6 (wiring), Task 7 (chart) |
| §2 Alcance: modo puntos | Task 1 (HTML), Task 5 (setupManualRows), Task 6 (wiring) |
| §2 Alcance: tabla Δ | Task 3 (calc), Task 5 (render), Task 6 (wiring) |
| §2 Alcance: derivada analítica + error % | Task 4 (expr), Task 3 (relativeErrorPct), Task 6 (wiring) |
| §2 Alcance: gráfico con tangente | Task 7 |
| §2 Alcance: botones ejemplo P4/P5 | Task 5 (loadExampleProblemaN), Task 6 (wiring) |
| §3 Estilo dark/neon + rainbow preservado | Task 2, Task 8 |
| §4 Arquitectura ESM + CDN | Task 1 (CDN), Task 3-7 (módulos) |
| §6 Lógica núcleo `calc.js` | Task 3 |
| §6 Lógica `expr.js` | Task 4 |
| §6 `plot.js` | Task 7 |
| §6 `ui.js` | Task 5 |
| §6 `main.js` | Task 6, ampliado en Task 7 |
| §7 Flujo de datos | Task 6 (calculate orquesta) |
| §8 Validación y errores | Task 5 (validate, showError), Task 6 (try/catch wrap) |
| §9 Verificación Problemas 4 y 5 | Task 6 (steps 3 y 4), Task 9 |
| §11 Riesgo: confirmar f(x) Problema 5 | Task 4 (verifica `exp(x)+x` da los valores del PDF), Task 9 |

Coverage 100%.

**Placeholder scan:** ningún "TBD" / "implementar después" / "manejar edge cases" sin código. Todo lo que se mencionó está con su código completo.

**Type consistency:**
- `buildDiffTable(ys)` definido Task 3, usado Task 6 con `ys` array — ok.
- `forwardDerivativeAtX0(table, h, n)` Task 3, usado Task 6 — ok.
- `relativeErrorPct(approx, exact)` Task 3, usado Task 6 — ok.
- `parseExpr(fStr)` Task 4 retorna `{eval, derivEval}` — usado en Task 4 mismo y vía `buildPointsFromFunction` en Task 6 — ok.
- `buildPointsFromFunction(fStr, x0, h, N)` Task 4 retorna `{xs, ys, expr}` — usado Task 6 — ok.
- `renderPlot('chart', expr, xs, x0, slopeAtX0)` Task 7 — usado Task 7 main.js — ok.
- `destroyPlot()` Task 7 — usado Task 7 — ok.
- IDs HTML coinciden entre Task 1 y los helpers Task 5/6/7: `fn-expr`, `fn-x0`, `fn-h`, `fn-n`, `fn-N`, `fn-calc`, `fn-load-p5`, `mn-x0`, `mn-h`, `mn-n`, `mn-calc`, `mn-load-p4`, `mn-add-row`, `mn-remove-row`, `manual-y-list`, `error-banner`, `formula`, `phi-prime`, `analytic-block`, `f-prime`, `err-pct`, `diff-table`, `chart-wrap`, `chart`. Todos chequeados.

Plan OK.
