# Δ⁺ LAB — Complejidad de algoritmos por diferencias hacia adelante

Proyecto de **Análisis Numérico** (Universidad de Mendoza): aplicación informática del método de **diferenciación hacia adelante**.

La app benchmarkea algoritmos reales (búsquedas, ordenamientos, multiplicación de matrices) midiendo su costo T(n) en tamaños **equiespaciados** (n₀, n₀+h, …, requisito del método), construye la **tabla de diferencias Δᵏ**, estima la tasa de crecimiento φ'(n₀) con la fórmula del práctico y **clasifica el Big-O empíricamente**: si T es polinomial de grado k, Δᵏ es constante y Δᵏ⁺¹ ≈ 0.

Se miden dos métricas por corrida:

- **Operaciones** (comparaciones / escrituras / multiplicaciones): determinista → tablas limpias.
- **Tiempo** (`performance.now()`, mediana de R repeticiones): con ruido → muestra cómo el error se amplifica en las columnas altas de la tabla (término ε'(x₀) del método).

## Cómo correrlo

Sitio estático sin build, pero usa módulos ES y un Web Worker, así que hay que servirlo por HTTP:

```
python -m http.server 8000
# o: npx serve
```

y abrir `http://localhost:8000`.

## Tests

```
node --test
```

Verifican el núcleo numérico contra los **Problemas 4 y 5 del práctico** (φ'(0) ≈ 140,041667 y f(x)=e²ˣ−x → error relativo ~4·10⁻⁶ %), los conteos exactos de operaciones de cada algoritmo y la clasificación de complejidad.

## Estructura

```
js/diff.js        núcleo numérico puro (tabla Δ, φ'(x₀), clasificador Big-O)
js/algorithms.js  algoritmos instrumentados con contador de operaciones
js/bench.js       runner de benchmarks (ops + mediana de tiempos)
js/worker.js      Web Worker que ejecuta el benchmark
js/ui.js          render de consola, tablas y fórmulas (KaTeX)
js/plot.js        gráficos (Chart.js)
js/main.js        wiring
docs/teoria.md    teoría del método (refs parseadas y verificadas)
test/             suite node --test
ref/              material original de la cátedra
```
