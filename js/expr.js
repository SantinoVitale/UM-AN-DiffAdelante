// math.js viene como global desde el CDN

export function parseExpr(fStr) {
  if (!fStr || !fStr.trim()) throw new Error("expresión vacía");
  let node;
  try {
    node = math.parse(fStr);
  } catch (e) {
    throw new Error(`Expresión inválida: ${e.message}`);
  }
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
      let v;
      try {
        v = fCompiled.evaluate({ x });
      } catch (e) {
        throw new Error(`Expresión inválida: ${e.message}`);
      }
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        throw new Error(`f no definida en x = ${x}`);
      }
      return v;
    },
    derivEval(x) {
      if (dCompiled) {
        try {
          const v = dCompiled.evaluate({ x });
          if (Number.isFinite(v)) return { value: v, method: 'symbolic' };
        } catch (_) { /* fall through to numeric */ }
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
