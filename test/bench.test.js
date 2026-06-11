import { test } from "node:test";
import assert from "node:assert/strict";
import { algorithms } from "../js/algorithms.js";
import { makeSizes, runBenchmark } from "../js/bench.js";
import { classifyComplexity } from "../js/diff.js";

// ---------- algoritmos instrumentados: conteos exactos ----------

test("búsqueda lineal (peor caso): exactamente n comparaciones", () => {
  const a = algorithms.linearSearch;
  const input = a.makeInput(137);
  assert.equal(a.execute(input), 137);
  assert.equal(a.model(137), 137);
});

test("bubble sort (pasadas completas): exactamente n(n−1)/2 comparaciones", () => {
  const a = algorithms.bubbleSort;
  const n = 80;
  const input = a.makeInput(n);
  assert.equal(a.execute(input), (n * (n - 1)) / 2);
  assert.equal(a.model(n), (n * (n - 1)) / 2);
});

test("bubble sort deja el array ordenado", () => {
  const a = algorithms.bubbleSort;
  const input = a.makeInput(50);
  a.execute(input);
  for (let i = 1; i < input.arr.length; i++) {
    assert.ok(input.arr[i - 1] <= input.arr[i]);
  }
});

test("insertion sort (peor caso, input descendente): exactamente n(n−1)/2 comparaciones", () => {
  const a = algorithms.insertionSort;
  const n = 80;
  const input = a.makeInput(n);
  assert.equal(a.execute(input), (n * (n - 1)) / 2);
  // y ordena
  for (let i = 1; i < input.arr.length; i++) {
    assert.ok(input.arr[i - 1] <= input.arr[i]);
  }
});

test("merge sort: escrituras W(n) = W(⌈n/2⌉) + W(⌊n/2⌋) + n, independiente de los datos", () => {
  const a = algorithms.mergeSort;
  const ref = (n) => (n <= 1 ? 0 : ref(Math.ceil(n / 2)) + ref(Math.floor(n / 2)) + n);
  for (const n of [2, 7, 64, 100]) {
    const input = a.makeInput(n);
    assert.equal(a.execute(input), ref(n), `n=${n}`);
  }
  // ordena
  const input = a.makeInput(60);
  a.execute(input);
  for (let i = 1; i < input.arr.length; i++) {
    assert.ok(input.arr[i - 1] <= input.arr[i]);
  }
});

test("multiplicación de matrices: exactamente n³ multiplicaciones", () => {
  const a = algorithms.matMul;
  const input = a.makeInput(8);
  assert.equal(a.execute(input), 512);
  assert.equal(a.model(8), 512);
});

test("búsqueda binaria: promedio de comparaciones ≈ log₂(n) − 1 (±1,5)", () => {
  const a = algorithms.binarySearch;
  const n = 1024;
  const ops = a.execute(a.makeInput(n));
  assert.ok(Math.abs(ops - (Math.log2(n) - 1)) < 1.5, `ops=${ops}`);
});

test("los algoritmos son deterministas (mismas ops en dos corridas)", () => {
  for (const a of Object.values(algorithms)) {
    const ops1 = a.execute(a.makeInput(64));
    const ops2 = a.execute(a.makeInput(64));
    assert.equal(ops1, ops2, a.id);
  }
});

test("metadatos completos: id, name, bigO, model, modelDerivative, defaults", () => {
  for (const a of Object.values(algorithms)) {
    assert.ok(a.id && a.name && a.bigO, a.id);
    assert.equal(typeof a.model(100), "number");
    assert.equal(typeof a.modelDerivative(100), "number");
    const { n0, h, N, reps } = a.defaults;
    assert.ok(n0 > 0 && h > 0 && N >= 5 && reps >= 1, a.id);
  }
});

// ---------- bench ----------

test("makeSizes genera N tamaños equiespaciados", () => {
  assert.deepEqual(makeSizes(100, 50, 5), [100, 150, 200, 250, 300]);
});

test("runBenchmark: bubble sort da ops = modelo exacto y tiempos positivos", async () => {
  const progress = [];
  const r = await runBenchmark("bubbleSort", { n0: 50, h: 50, N: 5, reps: 3 }, (p) =>
    progress.push(p)
  );
  assert.deepEqual(r.ns, [50, 100, 150, 200, 250]);
  r.ns.forEach((n, i) => assert.equal(r.ops[i], (n * (n - 1)) / 2));
  r.timesMs.forEach((t) => assert.ok(Number.isFinite(t) && t >= 0));
  assert.ok(progress.length >= 5, "reporta progreso por cada tamaño");
});

test("runBenchmark + classifyComplexity: bubble sort se clasifica O(n²)", async () => {
  const r = await runBenchmark("bubbleSort", { n0: 100, h: 100, N: 6, reps: 1 });
  const c = classifyComplexity(r.ns, r.ops);
  assert.equal(c.bigO, "O(n²)");
});

test("runBenchmark + classifyComplexity: merge sort se clasifica O(n log n)", async () => {
  const a = algorithms.mergeSort.defaults;
  const r = await runBenchmark("mergeSort", { ...a, reps: 1 });
  const c = classifyComplexity(r.ns, r.ops);
  assert.equal(c.bigO, "O(n log n)");
});

test("runBenchmark rechaza algoritmo inexistente", async () => {
  await assert.rejects(() => runBenchmark("noExiste", { n0: 10, h: 10, N: 5, reps: 1 }));
});
