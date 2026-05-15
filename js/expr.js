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
