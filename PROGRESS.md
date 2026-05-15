# Progreso actual — Diferencias hacia adelante

> Snapshot al 2026-05-15. Sirve para retomar después de un `/clear` o nueva sesión.

## Plan completo

Plan maestro de 9 tasks con código verificado, ejemplos del PDF y tests inline:
[`docs/superpowers/plans/2026-05-14-diff-adelante.md`](docs/superpowers/plans/2026-05-14-diff-adelante.md)

## Estado por Task

| # | Task | Estado | Archivos |
|---|------|--------|----------|
| 1 | HTML shell + CDN tags + layout tabs/inputs/results | ✅ | `index.html` |
| 2 | CSS dark/neon preservando `.rainbow-title` | ✅ | `css/style.css` |
| 3 | `calc.js` — buildDiffTable, forwardDerivativeAtX0, relativeErrorPct | ✅ | `js/calc.js` |
| 4 Step 1 | `expr.js` — parseExpr (math.js), buildPointsFromFunction | ✅ | `js/expr.js` |
| **4 Step 2** | **Verificación inline en consola del browser** | ⏳ **PRÓXIMO** | — |
| 4 Step 3 | Commit final de Task 4 | ⏳ | — |
| 5 | `ui.js` — DOM helpers, tabs, validación, render tabla/KaTeX, ejemplos precargables | ⏳ | `js/ui.js` |
| 6 | `plot.js` — Chart.js curva + scatter de puntos + tangente | ⏳ | `js/plot.js` |
| 7 | `main.js` — wiring de listeners + función `calculate()` | ⏳ | `js/main.js` |
| 8 | Borrar `js/index.js` (vacío, ya no se usa) | ⏳ | — |
| 9 | Verificación end-to-end con los dos ejemplos del PDF | ⏳ | — |

## Cómo retomar tras `/clear`

1. Abrir este `PROGRESS.md` para ubicarse y luego el plan grande (link arriba).
2. **Ejecutar Task 4 Step 2** — abrir `index.html` en el browser, abrir consola DevTools y pegar:

   ```js
   import('./js/expr.js').then(m => {
     const r = m.buildPointsFromFunction('exp(x) + x', 0.5, 0.01, 5);
     console.log('xs (esperado [0.5, 0.51, 0.52, 0.53, 0.54]):', r.xs);
     console.log('ys[0] (esperado ≈ 2.148721):', r.ys[0]);
     console.log("derivEval(0.5) (esperado {value≈2.6487, method:'symbolic'}):", r.expr.derivEval(0.5));
   });
   ```

3. Si todo da OK → confirmar y avanzar a **Task 4 Step 3** (commit) y luego **Task 5** (`ui.js`).

## Verificaciones ya pasadas

- **Task 3** — `forwardDerivativeAtX0` con ejemplo del PDF dio φ'(0) ≈ 140.0417 ✅
- **Task 4 Step 1** — `parseExpr` parsea expresiones con math.js, deriva simbólicamente con fallback numérico ✅

## Convenciones del proyecto

- **CDN globals**: math.js, Chart.js, KaTeX cargan via `<script>` en `index.html`.
- **ES Modules** nativos sin build step.
- **Funciones puras** en `calc.js` y `expr.js`; DOM/plot en `ui.js` y `plot.js`.
- **El usuario commitea manualmente** — el agente prepara los cambios y sugiere el comando, sin ejecutar `git`.
