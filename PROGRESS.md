# Progreso actual — Diferencias hacia adelante

> Snapshot al 2026-05-16. Sirve para retomar después de un `/clear` o nueva sesión.

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
| 8 | Pulido CSS (animaciones, responsive, scrollbar, a11y) | ✅ | `css/style.css` |
| 9 | Verificación end-to-end + robustez (P4, P5, edge cases) | ✅ | `js/expr.js`, `js/main.js` (ajuste mensajes) |

**🎉 Proyecto completo — 9/9 tasks ✅**

### Task 8 — alcance del pulido aplicado (revisión frontend-design)

Refactor integral de `css/style.css` manteniendo el `.rainbow-title` y la paleta cyan/violet/pink. Items aplicados:

- **Entrada escalonada en page-load**: `.rainbow-title` (delay 0.05s) → `.subtitle` (0.20s) → `.tabs` (0.35s) con keyframe `enter-up` (fade + translateY).
- **Pulso del resultado**: cuando se agrega `.fade-in` al `.results`, el `.big-num` corre `pulse-glow` (1.2s) reforzando el resultado principal.
- **Tabs con underline animado**: pseudo-elemento `::after` que crece desde el centro al hover/active (antes saltaba).
- **Botones con glow neón**: hover dispara `box-shadow: var(--glow-violet)` en lugar de sólo `brightness()`. Ghost button gana color + glow violetas al hover.
- **Inputs con hover state**: borde se aclara a `--bg-4` y el fondo se levanta levemente. Focus combina ring cyan + glow.
- **Spinners nativos ocultos** en `input[type=number]` para mantener la estética monoespaciada.
- **`#formula` enmarcado**: padding + fondo sutil + borde punteado para dar respiro al KaTeX. `overflow-x: auto` por seguridad.
- **`#chart-wrap` con borde** `1px solid var(--bg-3)` para consistencia con `.results`.
- **Body con gradient atmosférico**: radiales violet/cyan muy bajos en opacidad para profundidad sin distracción.
- **Tipografía fluida**: `clamp()` en `.rainbow-title` (1.6–2.6rem) y `.big-num` (1.5–2.1rem).
- **Diff-table con transición** suave en hover de fila + scroll horizontal en `#diff-table`.
- **Accesibilidad**:
  - `@media (prefers-reduced-motion: reduce)` anula animaciones y transiciones (incluido rainbow).
  - `:focus-visible` en tabs/botones/inputs para teclado.
  - `::selection` con violet del tema.
- **Breakpoint extra `≤480px`** para teléfonos angostos: padding más chico, formula y chart compactos, diff-table 0.62rem.
- **Scrollbar Firefox**: `scrollbar-color` + `scrollbar-width` además del estilo WebKit.

### Verificación pendiente Task 8

Refrescar `Ctrl+Shift+R` y validar visualmente:
1. **Page load**: ver el stagger title → subtitle → tabs.
2. **Calcular Problema 5**: el `2.64872` debe pulsar (glow cyan que crece y baja).
3. **Hover sobre tab inactiva**: underline cyan crece desde el centro.
4. **Hover sobre "Cargar ejemplo"**: pasa a violet con glow.
5. **Foco con Tab** (teclado): inputs/botones muestran ring cyan/violet sin outline default.
6. **Resize a ≤480px**: paddings reducidos, chart 240px, tabla legible.
7. **OS con reduced-motion activado**: el rainbow se queda quieto, sin fade-in.

## Task 9 — verificación estática (2026-05-16 ~1:30am)

Análisis código-a-código hecho antes de la verificación browser. Resumen:

| Test plan | Verificación estática | Veredicto |
|---|---|---|
| Step 1 — P4 manual, φ'(0)=140.042 | (1/0.006)·[0.899 − ½·0.117 + ⅓·0 − ¼·0.001] = 140.0417 | ✅ Matemáticamente OK |
| Step 2 — P5 función, φ'(0.5)≈2.6487, error 1e-7..1e-5 | exp+x deriva symbolic a exp(x)+1, eval(0.5) = 2.6487; truncation order 4 ~ 1e-7 | ✅ Matemáticamente OK |
| Step 3a — sin(x), x₀=0, n=4 | cos(0)=1; truncation ~4e-5% < 1e-4% | ✅ Predecible OK |
| Step 3b — 1/(x-0.5) en 0.5 | tras ajuste: `eval` lanza `f no definida en x = 0.5` | ✅ Mensaje matchea plan |
| Step 3c — `qwerty` | tras ajuste: math.js lanza "Undefined symbol", wrap = `Expresión inválida: Undefined symbol qwerty` | ✅ Mensaje matchea plan |
| Step 3d — h=0 | `validate()` línea 74: `errors.push("h debe ser > 0")` | ✅ Match exacto |
| Step 3e — n=1 recálculo | `renderFormulaKaTeX(1)` entra solo al branch k=1 (Δf(x_0) sin sumandos) | ✅ Predecible OK |

**Cambios aplicados durante la verificación:**

- `js/expr.js`:
  - `parseExpr` envuelve `math.parse` en try/catch → sintaxis inválida (ej. `+++`) sale como `Expresión inválida: …` en lugar de crashear.
  - `eval(x)` envuelve `fCompiled.evaluate` en try/catch → símbolos desconocidos (ej. `qwerty`) salen como `Expresión inválida: …`.
  - `eval(x)` reemplaza `f(${x}) = ${v} (no finito)` por `f no definida en x = ${x}` (mensaje más amigable).
  - `derivEval(x)` envuelve `dCompiled.evaluate` en try/catch → si symbolic falla en runtime, cae a numeric en vez de propagar.
- `js/main.js`:
  - Drop del prefijo `Error armando puntos:` — el mensaje de `expr.js` ya es autoexplicativo.

## Cómo retomar tras `/clear`

1. Abrir este `PROGRESS.md` para ubicarse y luego el plan grande (link arriba).
2. **Correr la checklist manual de Task 9 en Live Server** (ver abajo). Cuando los 5 robustez + las 2 re-verificaciones P4/P5 estén ✓, commit final opcional.

## Checklist manual pendiente — Task 9 (correr en Live Server, hard-refresh)

**Re-verificación post Task 8 + expr.js fix:**

- [ ] **P4**: tab "Puntos manuales" → "Cargar ejemplo Problema 4" → "Calcular"
  - φ'(x₀) ≈ 140.042
  - Tabla Δ¹=[0.899, 1.016, 1.133, 1.251], Δ²≈[0.117, 0.117, 0.118], Δ³≈[0, 0.001], Δ⁴≈[0.001]
  - No aparece bloque "f'(x₀)" ni chart
  - Fórmula KaTeX con n=4
- [ ] **P5**: tab "Función f(x)" → "Cargar ejemplo Problema 5" → "Calcular"
  - φ'(x₀) ≈ 2.6487
  - f'(x₀) ≈ 2.6487 (sin sufijo "(aprox numérica)")
  - error ≈ 1e-7 .. 1e-5 %
  - Chart visible con curva exp(x)+x, 5 puntos violetas, tangente rosa punteada
  - Tabla Δ visible

**Robustez (tests nuevos):**

- [ ] **3a** f(x)=`sin(x)`, x₀=0, h=0.01, N=5, n=4 → φ'(0) ≈ 1, error < 1e-4 %
- [ ] **3b** f(x)=`1/(x-0.5)`, x₀=0.5 → banner: **`f no definida en x = 0.5`**
- [ ] **3c** f(x)=`qwerty` → banner empieza con **`Expresión inválida:`**
- [ ] **3d** h=0 (cualquier modo) → banner: **`h debe ser > 0`**
- [ ] **3e** Recalcular P5 cambiando `n` de 4 a 1 → fórmula KaTeX se actualiza a solo `Δf(x_0)` (sin Δ²/Δ³/Δ⁴)

**Commit final (opcional):**
```
git add -A
git commit -m "Task 9: verificación end-to-end + mensajes de error amigables en expr.js"
```

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
- **Task 8** — pulido CSS aplicado y verificado visualmente:
  - Lint manual del CSS: sin selectores muertos, sin `transition` huérfanas, sin `!important` salvo override de inline-styles en responsive ✅
  - 17 items de polish + a11y aplicados (ver detalle arriba) ✅
  - Verificación visual confirmada por el usuario tras hard-refresh ✅
- **Task 9** — verificación end-to-end final (capturas `verify/task9-*.png`):
  - Re-verificación P4 (manual): φ'(x₀)=140.042, tabla Δ, sin chart ✅
  - Re-verificación P5 (función): φ'(x₀)=2.64872, f'(x₀) symbolic, chart con tangente ✅
  - Robustez 3a-3e (sin(x), 1/(x-0.5), qwerty, h=0, n=1): todos los banners y comportamientos coinciden con el plan ✅
  - Ajustes aplicados a `expr.js`+`main.js` para mensajes amigables ya validados browser ✅

## Convenciones del proyecto

- **CDN globals**: math.js, Chart.js, KaTeX cargan via `<script>` en `index.html`.
- **ES Modules** nativos sin build step.
- **Funciones puras** en `calc.js` y `expr.js`; DOM/plot en `ui.js` y `plot.js`.
- **El usuario commitea manualmente** — el agente prepara los cambios y sugiere el comando, sin ejecutar `git`.
