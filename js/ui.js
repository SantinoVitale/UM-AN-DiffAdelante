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
