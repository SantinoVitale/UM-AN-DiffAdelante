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
| 4 | `expr.js` — parseExpr (math.js), buildPointsFromFunction + verif. consola | ✅ | `js/expr.js` |
| 5 | `ui.js` — DOM helpers, tabs, validación, render tabla/KaTeX, ejemplos precargables | ✅ | `js/ui.js` |
| 6 | `main.js` wiring + borrar `js/index.js` + verif. Problemas 4/5 (sin chart) | ✅ | `js/main.js` |
| 7 | `plot.js` — Chart.js curva + scatter de puntos + tangente | ✅ | `js/plot.js` |
| **8** | **Pulido CSS (animaciones, responsive, scrollbar)** | ⏳ **PRÓXIMO** | `css/style.css` |
| 9 | Verificación end-to-end con los dos ejemplos del PDF | ⏳ | — |

## Cómo retomar tras `/clear`

1. Abrir este `PROGRESS.md` para ubicarse y luego el plan grande (link arriba).
2. **Ejecutar Task 6** — borrar `js/index.js`, crear `js/main.js` y verificar Problemas 4 y 5 en el browser (sin chart todavía). Pasos detallados en plan §Task 6.

## Verificaciones ya pasadas

- **Task 3** — `forwardDerivativeAtX0` con ejemplo del PDF dio φ'(0) ≈ 140.0417 ✅
- **Task 4 Step 1** — `parseExpr` parsea expresiones con math.js, deriva simbólicamente con fallback numérico ✅
- **Task 4 Step 2** — Verificación en consola: `xs=[0.5,0.51,0.52,0.53,0.54]`, `ys[0]=2.148721270700128`, `derivEval(0.5)={value:2.648721270700128, method:'symbolic'}` ✅
- **Task 6** — verificación browser end-to-end (capturas en `verify/`):
  - Initial render: título rainbow + subtitle cyan + 2 tabs + form ✅
  - P5 error case: banner rojo "f(x) vacía" tras Calcular con campo vacío ✅
  - P5 success: φ'(x₀)=2.64872, f'(x₀)=2.64872, error=1.266e-7%, KaTeX, tabla Δ ✅
  - P4 manual: tab switch ok, 5 filas y₀..y₄, φ'(x₀)=140.042, sin f'(x₀) ni error% ✅
- **Task 7** — Chart.js renderizado (capturas `verify/task7-*.png`):
  - P5 modo función: curva cyan + 5 puntos violetas + tangente rosa punteada ✅
  - P4 modo manual: chart ocultado correctamente ✅

## Convenciones del proyecto

- **CDN globals**: math.js, Chart.js, KaTeX cargan via `<script>` en `index.html`.
- **ES Modules** nativos sin build step.
- **Funciones puras** en `calc.js` y `expr.js`; DOM/plot en `ui.js` y `plot.js`.
- **El usuario commitea manualmente** — el agente prepara los cambios y sugiere el comando, sin ejecutar `git`.
