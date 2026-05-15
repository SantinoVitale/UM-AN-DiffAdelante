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
