// Runner de benchmarks: para cada tamaño n (equiespaciado) mide
//  - ops: operaciones contadas (deterministas, se miden una sola vez)
//  - timeMs: mediana de `reps` corridas cronometradas (con warm-up previo)
// Corre tanto en el navegador / Web Worker como en Node (tests).

import { algorithms } from "./algorithms.js";

export function makeSizes(n0, h, N) {
  if (!Number.isFinite(n0) || n0 <= 0) throw new Error("n₀ debe ser > 0");
  if (!Number.isFinite(h) || h <= 0) throw new Error("h debe ser > 0");
  if (!Number.isInteger(N) || N < 4) throw new Error("N debe ser entero ≥ 4");
  return Array.from({ length: N }, (_, i) => n0 + i * h);
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export async function runBenchmark(algoId, { n0, h, N, reps }, onProgress = () => {}) {
  const algo = algorithms[algoId];
  if (!algo) throw new Error(`Algoritmo desconocido: ${algoId}`);
  if (!Number.isInteger(reps) || reps < 1) throw new Error("reps debe ser entero ≥ 1");

  const ns = makeSizes(n0, h, N);
  const ops = [];
  const timesMs = [];

  for (let i = 0; i < ns.length; i++) {
    const n = ns[i];
    onProgress({ n, index: i, total: ns.length });

    // ops: deterministas, una sola corrida
    ops.push(algo.execute(algo.makeInput(n)));

    // warm-up (JIT) fuera de la medición
    algo.execute(algo.makeInput(n));

    const samples = [];
    for (let r = 0; r < reps; r++) {
      const input = algo.makeInput(n); // generación fuera del cronómetro
      const t0 = performance.now();
      algo.execute(input);
      const t1 = performance.now();
      samples.push(t1 - t0);
    }
    timesMs.push(median(samples) / algo.timeDivisor(n));

    // ceder el hilo para que el worker pueda postear progreso fluido
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  onProgress({ n: null, index: ns.length, total: ns.length });
  return { ns, ops, timesMs };
}
