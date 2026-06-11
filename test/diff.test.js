import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildDiffTable,
  forwardDerivativeAtX0,
  relativeErrorPct,
  classifyComplexity,
} from "../js/diff.js";

// ---------- buildDiffTable ----------

test("buildDiffTable reproduce la tabla del Problema 4 del práctico", () => {
  const ys = [0, 0.899, 1.915, 3.048, 4.299];
  const t = buildDiffTable(ys);
  assert.deepEqual(t[0], ys);
  const approx = (got, want) =>
    got.forEach((v, i) => assert.ok(Math.abs(v - want[i]) < 1e-9, `col ${v} vs ${want[i]}`));
  approx(t[1], [0.899, 1.016, 1.133, 1.251]);
  approx(t[2], [0.117, 0.117, 0.118]);
  approx(t[3], [0, 0.001]);
  approx(t[4], [0.001]);
});

test("buildDiffTable rechaza entrada vacía", () => {
  assert.throws(() => buildDiffTable([]));
});

// ---------- forwardDerivativeAtX0 ----------

test("Problema 4: φ'(0) ≈ 140,041667 con h=0,006 y n=4", () => {
  const t = buildDiffTable([0, 0.899, 1.915, 3.048, 4.299]);
  const d = forwardDerivativeAtX0(t, 0.006, 4);
  assert.ok(Math.abs(d - 140.041667) < 1e-4, `φ'(0) = ${d}`);
});

test("Problema 5: f(x)=e^(2x)−x, φ'(0,5) ≈ f'(0,5)=2e−1 con error relativo < 1e-5 %", () => {
  const f = (x) => Math.exp(2 * x) - x;
  const x0 = 0.5;
  const h = 0.01;
  const ys = [0, 1, 2, 3, 4].map((i) => f(x0 + i * h));
  const t = buildDiffTable(ys);
  const d = forwardDerivativeAtX0(t, h, 4);
  const exact = 2 * Math.E - 1; // 4.4365637...
  const errPct = relativeErrorPct(d, exact);
  assert.ok(errPct < 1e-5, `error relativo ${errPct} %`);
});

test("forwardDerivativeAtX0 valida h y n", () => {
  const t = buildDiffTable([1, 2, 3]);
  assert.throws(() => forwardDerivativeAtX0(t, 0, 1));
  assert.throws(() => forwardDerivativeAtX0(t, 0.1, 0));
  assert.throws(() => forwardDerivativeAtX0(t, 0.1, 5)); // faltan puntos para Δ^5
});

// ---------- relativeErrorPct ----------

test("relativeErrorPct casos básicos y degenerados", () => {
  assert.equal(relativeErrorPct(110, 100), 10);
  assert.equal(relativeErrorPct(1, 0), null);
  assert.equal(relativeErrorPct(NaN, 1), null);
});

// ---------- classifyComplexity ----------

const ns = [100, 200, 300, 400, 500, 600, 700, 800];

test("clasifica serie constante como O(1)", () => {
  const r = classifyComplexity(ns, ns.map(() => 42));
  assert.equal(r.bigO, "O(1)");
});

test("clasifica serie lineal 3n+7 como O(n)", () => {
  const r = classifyComplexity(ns, ns.map((n) => 3 * n + 7));
  assert.equal(r.bigO, "O(n)");
  assert.equal(r.degree, 1);
});

test("clasifica n(n−1)/2 (comparaciones de bubble sort) como O(n²)", () => {
  const r = classifyComplexity(ns, ns.map((n) => (n * (n - 1)) / 2));
  assert.equal(r.bigO, "O(n²)");
  assert.equal(r.degree, 2);
});

test("clasifica n³ como O(n³)", () => {
  const r = classifyComplexity(ns, ns.map((n) => n ** 3));
  assert.equal(r.bigO, "O(n³)");
  assert.equal(r.degree, 3);
});

test("clasifica n·log₂(n) como O(n log n)", () => {
  const r = classifyComplexity(ns, ns.map((n) => n * Math.log2(n)));
  assert.equal(r.bigO, "O(n log n)");
});

test("clasifica log₂(n) como O(log n)", () => {
  const r = classifyComplexity(ns, ns.map((n) => Math.log2(n)));
  assert.equal(r.bigO, "O(log n)");
});

test("clasifica n² con ruido ±1% como O(n²) con tolerancia amplia", () => {
  // ruido determinista (sin Math.random) para reproducibilidad
  const noisy = ns.map((n, i) => n * n * (1 + 0.01 * Math.sin(i * 999)));
  const r = classifyComplexity(ns, noisy, { tol: 0.25 });
  assert.equal(r.bigO, "O(n²)");
});

test("classifyComplexity exige ns equiespaciados", () => {
  assert.throws(() => classifyComplexity([1, 2, 4, 8], [1, 2, 3, 4]));
});

test("classifyComplexity devuelve justificación legible", () => {
  const r = classifyComplexity(ns, ns.map((n) => (n * (n - 1)) / 2));
  assert.ok(typeof r.justification === "string" && r.justification.length > 0);
});
