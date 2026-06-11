# Teoría: Diferenciación por diferencias hacia adelante

Resumen de `ref/DiferenciacionAdelante.pdf` (cátedra de Análisis Numérico, UM), con las fórmulas reconstruidas (el texto extraíble del PDF las tiene rotas). `ref/Integración y diferenciación.pdf` cubre además integración numérica y diferencias centradas, fuera del alcance de este proyecto.

## Planteo

Se dispone de un conjunto de puntos (xᵢ, yᵢ) que se suponen parte de una función continua f ∈ C[a, b], y por lo tanto derivable. Se considera φ, la función de interpolación de f (polinomio de Newton en diferencias no divididas):

- f(xᵢ) = φ(xᵢ) para todo xᵢ ∈ [a, b]
- **Requisito: puntos equiespaciados** — xᵢ₊₁ − xᵢ = h constante, es decir xᵢ − x₀ = i·h
- f(x) = φ(x) + ε(x), entonces f'(x) = φ'(x) + ε'(x)
  - φ'(x): derivada aproximada
  - ε'(x): error del método

## Fórmula de diferencias hacia adelante (derivada primera en x₀)

Se deriva el polinomio de interpolación de Newton respecto de x y se aplica en x₀ (varios términos se anulan porque cada factor (x − xᵢ) evaluado en x₀ vale −i·h):

```
φ'(x₀) = (1/h) · [ Δf(x₀) − Δ²f(x₀)/2 + Δ³f(x₀)/3 − … + (−1)ⁿ⁻¹ · Δⁿf(x₀)/n ]

       = (1/h) · Σₖ₌₁ⁿ (−1)ᵏ⁻¹ · Δᵏf(x₀) / k
```

donde Δᵏf(x₀) es la k-ésima diferencia hacia adelante evaluada en x₀ (primera fila de la columna k de la tabla de diferencias):

- Δf(xᵢ) = f(xᵢ₊₁) − f(xᵢ)
- Δᵏf(xᵢ) = Δᵏ⁻¹f(xᵢ₊₁) − Δᵏ⁻¹f(xᵢ)

Para usar n términos se necesitan n+1 puntos equiespaciados desde x₀ hacia adelante.

## Error del método

Partiendo del error de interpolación

```
ε(x) = (x − x₀)(x − x₁)…(x − xₙ) · f⁽ⁿ⁺¹⁾(ξ) / (n+1)!     con ξ ∈ (x₀, xₙ)
```

se deriva respecto de x y se aplica en x₀ (los términos con factor (x₀ − x₀) se anulan; cada factor restante vale −i·h):

```
ε'(x₀) = (−1)ⁿ · hⁿ · f⁽ⁿ⁺¹⁾(ξ) / (n+1)     con ξ ∈ (x₀, xₙ)
```

El error es **O(hⁿ)**: decrece al achicar h y al sumar términos, pero en datos medidos (con ruido) las diferencias de orden alto amplifican el ruido.

## Derivadas de orden superior

El procedimiento es análogo: se vuelve a derivar el polinomio de interpolación tantas veces como se requiera y se aplica en x₀.

## Problema 4 (del práctico) — datos medidos

Velocidad del aire v (m/s) a distintas distancias y (m) de una superficie plana; se busca el esfuerzo cortante τ = μ·(dv/dy) en y = 0, con μ = 1,8·10⁻⁵ N·s/m².

| y (m)   | 0 | 0,002 | 0,006 | 0,012 | 0,018 | 0,024 |
|---------|---|-------|-------|-------|-------|-------|
| v (m/s) | 0 | 0,287 | 0,899 | 1,915 | 3,048 | 4,299 |

Los puntos **no** están equiespaciados: se descarta y = 0,002 para que h = 0,006 sea constante. Tabla de diferencias con ys = [0; 0,899; 1,915; 3,048; 4,299]:

| x  | f(x)  | Δf    | Δ²f   | Δ³f   | Δ⁴f   |
|----|-------|-------|-------|-------|-------|
| 0      | 0     |       |       |       |       |
| 0,006  | 0,899 | 0,899 |       |       |       |
| 0,012  | 1,915 | 1,016 | 0,117 |       |       |
| 0,018  | 3,048 | 1,133 | 0,117 | 0     |       |
| 0,024  | 4,299 | 1,251 | 0,118 | 0,001 | 0,001 |

```
φ'(0) = (1/0,006)·[0,899 − 0,117/2 + 0/3 − 0,001/4] = 140,041667 s⁻¹
τ = 1,8·10⁻⁵ · 140,041667 ≈ 2,52·10⁻³ N/m²
```

## Problema 5 (del práctico) — comparación de métodos

Función **f(x) = e²ˣ − x** (reconstruida desde la tabla del PDF: e^0,96−0,48 = 2,131696; e^1−0,5 = 2,218282; e^1,04−0,52 = 2,309217). Se busca f'(0,5) con h = 0,01. Valor exacto: f'(x) = 2e²ˣ − 1 → f'(0,5) = 2e − 1 ≈ 4,4365637.

Tabla de diferencias hacia adelante (x₀ = 0,5):

| x    | f(x)     | Δf        | Δ²f       | Δ³f       | Δ⁴f       |
|------|----------|-----------|-----------|-----------|-----------|
| 0,50 | 2,218282 |           |           |           |           |
| 0,51 | 2,263195 | 0,0449129 |           |           |           |
| 0,52 | 2,309217 | 0,0460223 | 0,0011093 |           |           |
| 0,53 | 2,356371 | 0,0471540 | 0,0011317 | 0,0000224 |           |
| 0,54 | 2,404680 | 0,0483086 | 0,0011546 | 0,0000229 | 0,0000005 |

```
φ'(0,5) = (1/0,01)·[0,0449129 − 0,0011093/2 + 0,0000224/3 − 0,0000005/4] ≈ 4,4365622
```

Errores relativos porcentuales (vs. cálculo directo):
- Centradas 2 puntos: −0,00816949 %
- Centradas 4 puntos: 6,53578·10⁻⁷ %
- **Hacia adelante (n=4): 4,05445·10⁻⁶ %**

Conclusión de la cátedra: más puntos/términos → mayor precisión; las centradas de 4 puntos y la fórmula hacia adelante con la tabla completa son muy superiores a la centrada simple de 2 puntos.

## Conexión con este proyecto (análisis de complejidad)

- Un benchmark con tamaños n₀, n₀+h, n₀+2h, … cumple **por construcción** el requisito de equiespaciado.
- Si el costo T(n) es polinomial de grado k, la columna Δᵏ de la tabla es constante y Δᵏ⁺¹ ≈ 0 → permite clasificar el Big-O.
- φ'(n₀) estima la tasa de crecimiento del costo en n₀ con la fórmula del práctico.
- El contraste entre la métrica determinista (operaciones) y la ruidosa (tiempo) ilustra el término de error ε'(x₀) y la amplificación del ruido en diferencias de orden alto.
