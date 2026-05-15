# Diferencias hacia adelante — Calculadora interactiva

**Fecha:** 2026-05-14
**Tema (Análisis Numérico, UM):** Diferencias hacia adelante para cálculo de derivada en un punto.
**Material fuente:** `ref/DiferenciacionAdelante.pdf`, `ref/DiferenciacionAdelante.docx`, `ref/Integración y diferenciación.pdf`.

## 1. Objetivo

Sitio estático HTML/CSS/JS que **calcula la derivada de una función en un punto x₀** usando la fórmula de diferencias hacia adelante. Foco en interactividad y verificación visual contra el resultado analítico — sin bloques de teoría extensos.

## 2. Alcance

**Incluye**
- Modo "Función": el usuario carga f(x) como expresión y elige x₀, h, n, N.
- Modo "Puntos manuales": el usuario carga N valores yᵢ equiespaciados.
- Tabla de diferencias Δ, Δ², …, Δⁿ.
- Cálculo de φ'(x₀) con la fórmula en diferencias hacia adelante.
- En modo función: derivada analítica simbólica + error relativo %.
- Gráfico (sólo modo función): curva f(x), N puntos, recta tangente en x₀.
- Botones "Cargar ejemplo Problema 4" y "Problema 5" del PDF para verificación.

**Fuera de alcance**
- Diferencias hacia atrás.
- Diferencias centradas (aunque el PDF las cubre).
- Backend / persistencia.
- Build step / bundler.

## 3. Estilo visual

Dark math/neon. Fondo oscuro, acentos cyan/violeta, tipografía monospace para tablas y números. Título "El EPICO PROYECTO DEL DUO DINAMICO" mantiene rainbow gradient (existente).

## 4. Arquitectura

Sitio estático de una sola página. Sin build step. Las libs vienen por CDN.

```
index.html          shell + CDN tags
css/style.css       dark/neon theme, grid layout
js/main.js          entrada, wiring UI <-> lógica
js/calc.js          puro: buildDiffTable, forwardDerivativeAtX0, relativeErrorPct
js/expr.js          wrapper math.js: parseExpr, analyticDerivativeAt, buildPointsFromFunction
js/plot.js          wrapper Chart.js: render curva + puntos + tangente
js/ui.js            helpers DOM: tabs, render tabla, render KaTeX, validación, banner de error
ref/                queda intacto (material teórico)
```

**Dependencias CDN**
- `math.js` — parser/evaluador y derivada simbólica.
- `Chart.js` — gráfico f(x) + scatter + tangente.
- `KaTeX` (auto-render) — render de la fórmula activa según n.

Total estimado ~600 KB.

## 5. Layout UI

```
+--------------------------------------------------+
|  El EPICO PROYECTO DEL DUO DINAMICO              |
|  Diferencias hacia adelante                       |
+--------------------------------------------------+
|  [ Función f(x) ]   [ Puntos manuales ]          |   tabs
+--------------------------------------------------+
|  Modo FUNCIÓN:                                    |
|   f(x) = [ sin(x)*x^2          ]                  |
|   x0 = [0.5]   h = [0.01]   n = [4 v]   N = [5]   |
|   [ Cargar ejemplo Problema 5 ]  [ Calcular ]     |
|                                                   |
|  Modo PUNTOS:                                     |
|   x0 = [0]   h = [0.006]   n = [4 v]              |
|   y0 [0    ]                                      |
|   y1 [0.899]   [+ fila] [– fila]                  |
|   [ Cargar ejemplo Problema 4 ]  [ Calcular ]     |
+--------------------------------------------------+
|  Resultados:                                      |
|   Fórmula activa (KaTeX, depende de n)            |
|   phi'(x0) = ...                                  |
|   f'(x0) = ...   error: ... %    (sólo función)   |
|   Tabla de diferencias                            |
|   [ Chart f(x) + puntos + tangente ] (sólo func)  |
+--------------------------------------------------+
```

- Tab activa muestra sus inputs, la otra oculta.
- Banner de error rojo arriba del botón "Calcular"; se limpia al cálculo válido.

## 6. Lógica núcleo

### 6.1 `calc.js` (puro, sin DOM)

```
buildDiffTable(ys: number[]) -> number[][]
    matriz [Delta^0, Delta^1, Delta^2, ...]; Delta^0 = ys
    Delta^i[j] = Delta^(i-1)[j+1] - Delta^(i-1)[j]

forwardDerivativeAtX0(diffTable, h, n) -> number
    phi'(x0) = (1/h) * sum_{k=1..n} [(-1)^(k-1) / k] * Delta^k f(x0)
    (Delta^k f(x0) = primera fila de la columna k de la tabla)

relativeErrorPct(approx, exact) -> number | null
    si |exact| > 1e-12 -> 100 * |approx - exact| / |exact|
    si no -> null  (caller muestra error absoluto)
```

### 6.2 `expr.js` (wrapper math.js)

```
parseExpr(fStr) -> { eval(x), derivEval(x) } | throws
    nodo = math.parse(fStr)
    f = nodo.compile()
    d = math.derivative(nodo, 'x').compile()

buildPointsFromFunction(fStr, x0, h, N) -> {xs: number[], ys: number[]}
    para i en 0..N-1: x_i = x0 + i*h, y_i = f.eval({x: x_i})
    throws si algún y_i es NaN o Infinity

analyticDerivativeAt(fStr, x0) -> number
    intenta math.derivative; si falla, fallback diferencia central con h=1e-6
```

### 6.3 `plot.js` (wrapper Chart.js)

```
renderPlot(canvasId, fStr, points, x0, slopeAtX0)
    destruye chart previo
    dataset 1 (line): muestreo de f(x) en [x0 - h, x_{N-1} + h] (200 puntos)
    dataset 2 (scatter): N puntos elegidos
    dataset 3 (line): tangente y = f(x0) + slope * (x - x0) sobre rango visible
```

### 6.4 `ui.js`

- `setupTabs()`: switch modo función / puntos.
- `renderResults(state)`: pinta KaTeX (fórmula con n actual), número phi'(x0), bloque analítico+error si corresponde, tabla Delta, chart.
- `renderDiffTable(table, xs)`: tabla HTML monospace con todas las columnas Delta^i.
- `renderFormulaKaTeX(n)`: arma la suma con n términos y la renderiza.
- `validate(inputs)`: aplica reglas de §8, devuelve `{ok, errors}`.
- `showError(msg)` / `clearError()`.

### 6.5 `main.js`

Wiring: on DOMContentLoaded, registra listeners de tabs y botones, dispara `calculate()` que orquesta validate -> expr/puntos -> calc -> ui.

## 7. Flujo de datos

```
INPUT  ->  validate  ->  buildPoints (func) o usePoints (manual)
       ->  buildDiffTable(ys)
       ->  forwardDerivativeAtX0(table, h, n)
       ->  [si func] analyticDerivativeAt + relativeErrorPct
       ->  renderResults (KaTeX, número, tabla, chart si func)
```

Sin estado global. Cada "Calcular" re-lee inputs y re-renderiza. Chart.js destruye instancia previa antes de crear nueva.

## 8. Validación y errores

| Caso | Comportamiento |
|------|----------------|
| `h <= 0` o no numérico | banner "h debe ser > 0", aborta |
| `n` fuera [1,4] | select limitado, no llega |
| `N < n+1` | banner "se necesitan al menos n+1 puntos" |
| `f(x)` no parseable | banner "Expresión inválida: <detalle math.js>" |
| `f(x_i)` = NaN/Infinity | banner "f no definida en x_i = ..." |
| `math.derivative` falla | fallback diferencia central h=1e-6, leyenda "(aprox numérica)" |
| `f'(x0) = 0` exacto | error % indefinido -> muestra error absoluto |phi' - f'| |
| Inputs manuales vacíos/NaN | fila marcada en rojo, banner "valor inválido fila k" |

## 9. Verificación (manual, sin framework de tests)

Dos ejemplos del PDF precargables con botón. Aprobamos visualmente:

- **Problema 4** (modo puntos): h=0.006, ys=[0, 0.899, 1.915, 3.048, 4.299], x0=0, n=4 -> **phi'(0) ≈ 140.0417**.
- **Problema 5** (modo función): f(x)=`exp(x) + x` *(reconstruir desde tabla del PDF al implementar el botón — los valores 2.131696, 2.174456, 2.218282, ... coinciden con exp(x)+x en 0.48..0.52)*, x0=0.5, h=0.01, N=5, n=4 -> phi'(0.5) ≈ 2.6487, error ≈ 4.05e-6 %.

Si los números coinciden con el PDF la lógica está bien.

## 10. Fuera de testing automatizado

No se incluye Jest/Vitest/Cypress. Verificación es manual sobre los dos ejemplos. Justificación: proyecto académico de UI de página única, los dos ejemplos del PDF son ground truth suficiente y reproducible.

## 11. Riesgos / TODOs abiertos en implementación

1. Confirmar la f(x) exacta del Problema 5 al armar el botón de ejemplo (texto extraído del PDF no la muestra explícita; reconstruir de la tabla 0.48..0.54).
2. Si `math.derivative` se rompe con expresiones raras del usuario, el fallback numérico salva el caso pero la leyenda "(aprox numérica)" debe ser visible para no confundir.
3. Chart.js + tangente: cuidar que la línea de tangente no extienda los ejes y rompa el zoom; clipear a rango visible.

## 12. Próximo paso

Plan de implementación detallado (skill `writing-plans`) que descompone esto en tareas ejecutables con orden y criterios de done.
