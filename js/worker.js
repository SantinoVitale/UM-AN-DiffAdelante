// Web Worker: corre el benchmark sin congelar la UI y reporta progreso.
import { runBenchmark } from "./bench.js";

self.onmessage = async (e) => {
  const { algoId, params } = e.data;
  try {
    const result = await runBenchmark(algoId, params, (p) => {
      self.postMessage({ type: "progress", ...p });
    });
    self.postMessage({ type: "done", result });
  } catch (err) {
    self.postMessage({ type: "error", message: err.message });
  }
};
