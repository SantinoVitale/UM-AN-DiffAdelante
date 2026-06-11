// Núcleo numérico puro (sin DOM): diferencias hacia adelante y clasificación de complejidad.
// Fórmulas según ref/DiferenciacionAdelante.pdf (ver docs/teoria.md).

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

// φ'(x₀) = (1/h) · Σ_{k=1..n} (−1)^(k−1) · Δᵏf(x₀) / k
export function forwardDerivativeAtX0(diffTable, h, n) {
  if (!Number.isFinite(h) || h <= 0) throw new Error("h debe ser > 0");
  if (!Number.isInteger(n) || n < 1) throw new Error("n debe ser entero >= 1");
  let sum = 0;
  for (let k = 1; k <= n; k++) {
    if (!diffTable[k] || diffTable[k].length === 0) {
      throw new Error(`No hay datos para Δ^${k} f(x0). Necesitás al menos ${k + 1} puntos.`);
    }
    const deltaK_at_0 = diffTable[k][0];
    const sign = k % 2 === 1 ? 1 : -1;
    sum += (sign * deltaK_at_0) / k;
  }
  return sum / h;
}

export function relativeErrorPct(approx, exact) {
  if (!Number.isFinite(approx) || !Number.isFinite(exact)) return null;
  if (Math.abs(exact) < 1e-12) return null;
  return (100 * Math.abs(approx - exact)) / Math.abs(exact);
}

// --- Clasificación de complejidad a partir de la tabla de diferencias ---
//
// Base teórica: si T(n) es polinomial de grado k y los n están equiespaciados,
// la columna Δᵏ es constante y Δᵏ⁺¹ ≡ 0. Series no polinomiales del universo
// {log n, n·log n} se reconocen por la tendencia de Δ¹ y Δ².

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function meanAbs(xs) {
  return mean(xs.map(Math.abs));
}

// Dispersión relativa de una columna: (max − min) / |media|
function relSpread(xs) {
  const m = Math.abs(mean(xs));
  if (m < 1e-300) return Infinity;
  return (Math.max(...xs) - Math.min(...xs)) / m;
}

export function classifyComplexity(ns, ys, { tol = 0.05, maxDegree = 4 } = {}) {
  if (!Array.isArray(ns) || !Array.isArray(ys) || ns.length !== ys.length) {
    throw new Error("ns e ys deben ser arrays de igual longitud");
  }
  if (ns.length < 4) throw new Error("Se necesitan al menos 4 puntos");
  const h = ns[1] - ns[0];
  for (let i = 1; i < ns.length; i++) {
    if (Math.abs(ns[i] - ns[i - 1] - h) > 1e-9 * Math.abs(h)) {
      throw new Error("Los tamaños n deben estar equiespaciados (requisito del método)");
    }
  }

  const table = buildDiffTable(ys);
  const scale = meanAbs(ys);
  const d1 = table[1];

  // O(1): las primeras diferencias son despreciables frente a la escala de T(n)
  if (meanAbs(d1) <= 1e-9 + 1e-6 * scale) {
    return {
      bigO: "O(1)",
      degree: 0,
      justification: "Δ¹ ≈ 0: el costo no depende de n.",
    };
  }

  const increasing = d1[d1.length - 1] > d1[0];

  // Sublineal: Δ¹ > 0 pero decreciente hacia 0 → O(log n) en nuestro universo
  if (!increasing && d1.every((v) => v > 0) && d1[d1.length - 1] / d1[0] < 0.7) {
    return {
      bigO: "O(log n)",
      degree: null,
      justification:
        "Δ¹ es positiva pero decrece hacia 0: el costo crece cada vez más lento (sublineal).",
    };
  }

  // Polinomial: menor k con Δᵏ ~constante y Δᵏ⁺¹ despreciable
  const names = { 1: "O(n)", 2: "O(n²)", 3: "O(n³)", 4: "O(n⁴)" };
  for (let k = 1; k <= Math.min(maxDegree, table.length - 1); k++) {
    const col = table[k];
    if (col.length < 2) break;
    const spread = relSpread(col);
    const next = table[k + 1];
    const nextNegligible =
      !next || next.length === 0 || meanAbs(next) <= Math.max(tol, 0.1) * meanAbs(col);
    if (spread <= tol && nextNegligible) {
      return {
        bigO: names[k],
        degree: k,
        justification:
          `Δ^${k} es ~constante (dispersión ${(spread * 100).toFixed(2)} %) y ` +
          `Δ^${k + 1} ≈ 0 → polinomio de grado ${k}.`,
      };
    }
  }

  // n·log n: T(n) superlineal pero el costo por elemento z = T(n)/n crece como
  // un logaritmo (incrementos positivos decrecientes). Mirar z en vez de Δ²
  // es robusto frente a costos lineales a trozos (p. ej. merge sort, cuyas
  // escrituras tienen quiebres en potencias de 2).
  const z = ys.map((y, i) => y / ns[i]);
  const dz = buildDiffTable(z)[1];
  if (increasing && dz.every((v) => v > 0) && dz[dz.length - 1] / dz[0] < 0.7) {
    return {
      bigO: "O(n log n)",
      degree: null,
      justification:
        "T(n) crece más que lineal y el costo por elemento T(n)/n crece como log n: superlineal y subcuadrático.",
    };
  }

  return {
    bigO: "indeterminada",
    degree: null,
    justification:
      "Ninguna columna Δᵏ se estabiliza con la tolerancia dada (puede ser ruido de medición: probá más repeticiones o use la métrica de operaciones).",
  };
}
