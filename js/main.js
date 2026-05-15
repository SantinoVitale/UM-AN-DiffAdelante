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
