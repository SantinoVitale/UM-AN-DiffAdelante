// Algoritmos instrumentados con contador de operaciones dominantes.
// Inputs deterministas (semilla fija o peor caso) → las ops son 100% reproducibles.
//
// Contrato de cada algoritmo:
//   makeInput(n)        genera el input (NO se cronometra)
//   execute(input)      corre el algoritmo y devuelve las operaciones contadas
//   model(n)            ops según el modelo teórico (exacto o aproximado, ver modelExact)
//   modelDerivative(n)  derivada del modelo teórico (para comparar con φ'(n₀))
//   timeDivisor(n)      divisor del tiempo medido (1 salvo búsqueda binaria, que
//                       ejecuta n búsquedas y reporta el promedio por búsqueda)
//   defaults            parámetros sugeridos de benchmark { n0, h, N, reps }

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(n, seed = 12345) {
  const rnd = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const LN2_INV = 1 / Math.LN2;

export const algorithms = {
  linearSearch: {
    id: "linearSearch",
    name: "Búsqueda lineal (peor caso)",
    bigO: "O(n)",
    opsLabel: "comparaciones",
    modelLabel: "n",
    modelExact: true,
    makeInput: (n) => ({ arr: shuffled(n), target: -1 }), // ausente → recorre todo
    execute({ arr, target }) {
      let ops = 0;
      for (let i = 0; i < arr.length; i++) {
        ops++;
        if (arr[i] === target) break;
      }
      return ops;
    },
    model: (n) => n,
    modelDerivative: () => 1,
    timeDivisor: () => 1,
    defaults: { n0: 250000, h: 250000, N: 6, reps: 7 },
  },

  binarySearch: {
    id: "binarySearch",
    name: "Búsqueda binaria (promedio sobre los n elementos)",
    bigO: "O(log n)",
    opsLabel: "comparaciones promedio por búsqueda",
    modelLabel: "log₂(n) − 1",
    modelExact: false,
    makeInput: (n) => ({ arr: Array.from({ length: n }, (_, i) => i) }),
    execute({ arr }) {
      const n = arr.length;
      let total = 0;
      for (let target = 0; target < n; target++) {
        let lo = 0;
        let hi = n - 1;
        while (lo <= hi) {
          total++;
          const mid = (lo + hi) >> 1;
          if (arr[mid] === target) break;
          if (arr[mid] < target) lo = mid + 1;
          else hi = mid - 1;
        }
      }
      return total / n; // promedio por búsqueda
    },
    model: (n) => Math.log2(n) - 1,
    modelDerivative: (n) => LN2_INV / n,
    timeDivisor: (n) => n, // tiempo promedio por búsqueda
    defaults: { n0: 100000, h: 100000, N: 8, reps: 7 },
  },

  bubbleSort: {
    id: "bubbleSort",
    name: "Bubble sort (pasadas completas)",
    bigO: "O(n²)",
    opsLabel: "comparaciones",
    modelLabel: "n(n−1)/2",
    modelExact: true,
    makeInput: (n) => ({ arr: shuffled(n) }),
    execute({ arr }) {
      let ops = 0;
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          ops++;
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          }
        }
      }
      return ops;
    },
    model: (n) => (n * (n - 1)) / 2,
    modelDerivative: (n) => n - 0.5,
    timeDivisor: () => 1,
    defaults: { n0: 200, h: 200, N: 6, reps: 5 },
  },

  insertionSort: {
    id: "insertionSort",
    name: "Insertion sort (peor caso: input descendente)",
    bigO: "O(n²)",
    opsLabel: "comparaciones",
    modelLabel: "n(n−1)/2",
    modelExact: true,
    makeInput: (n) => ({ arr: Array.from({ length: n }, (_, i) => n - i) }),
    execute({ arr }) {
      let ops = 0;
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0) {
          ops++;
          if (arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
          } else {
            break;
          }
        }
        arr[j + 1] = key;
      }
      return ops;
    },
    model: (n) => (n * (n - 1)) / 2,
    modelDerivative: (n) => n - 0.5,
    timeDivisor: () => 1,
    defaults: { n0: 200, h: 200, N: 6, reps: 5 },
  },

  mergeSort: {
    id: "mergeSort",
    name: "Merge sort",
    bigO: "O(n log n)",
    opsLabel: "escrituras",
    modelLabel: "n·log₂(n)",
    modelExact: false,
    makeInput: (n) => ({ arr: shuffled(n) }),
    execute({ arr }) {
      // se cuentan escrituras del merge: W(n) = W(⌈n/2⌉) + W(⌊n/2⌋) + n,
      // independiente de los datos → reproducible
      let ops = 0;
      const aux = arr.slice();
      function sort(lo, hi) {
        if (hi - lo <= 1) return;
        const mid = (lo + hi) >> 1;
        sort(lo, mid);
        sort(mid, hi);
        for (let k = lo; k < hi; k++) aux[k] = arr[k];
        let i = lo;
        let j = mid;
        for (let k = lo; k < hi; k++) {
          if (i < mid && (j >= hi || aux[i] <= aux[j])) arr[k] = aux[i++];
          else arr[k] = aux[j++];
          ops++;
        }
      }
      sort(0, arr.length);
      return ops;
    },
    model: (n) => (n <= 1 ? 0 : n * Math.log2(n)),
    modelDerivative: (n) => Math.log2(n) + LN2_INV,
    timeDivisor: () => 1,
    defaults: { n0: 20000, h: 20000, N: 6, reps: 5 },
  },

  matMul: {
    id: "matMul",
    name: "Multiplicación de matrices n×n",
    bigO: "O(n³)",
    opsLabel: "multiplicaciones",
    modelLabel: "n³",
    modelExact: true,
    makeInput(n) {
      const rnd = mulberry32(777);
      const a = new Float64Array(n * n).map(() => rnd());
      const b = new Float64Array(n * n).map(() => rnd());
      return { a, b, n, out: new Float64Array(n * n) };
    },
    execute({ a, b, n, out }) {
      let ops = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let s = 0;
          for (let k = 0; k < n; k++) {
            s += a[i * n + k] * b[k * n + j];
            ops++;
          }
          out[i * n + j] = s;
        }
      }
      return ops;
    },
    model: (n) => n ** 3,
    modelDerivative: (n) => 3 * n * n,
    timeDivisor: () => 1,
    defaults: { n0: 20, h: 20, N: 6, reps: 5 },
  },
};
