import { createCfg } from "./cfg/cfg.service";
import type { Cfg } from "./cfg/types/cfg";
import { print } from "./cfg/utils/grammar-operations.utils";

function App() {
  let test: Cfg | null = null;
  let err: unknown = null;

  try {
    test = createCfg(
      new Set(["a", "b", "c"]), // terminals
      new Set(["A", "B", "C", "D", "E"]), // non-terminals
      {
        A: [["a", "B"], ["b", "C"], ["D"]],
        B: [["b", "B"], ["c", "A"], ["a"]],
        C: [["c", "C"], ["a", "B"], ["b"]],
        D: [["a", "E"], ["b"]],
        E: [["c", "A"], ["a"], ["b", "D"]],
      },
      "A",
    );
  } catch (error) {
    err = error;
  }

  return (
    <>
      <h1>Context-free grammar visualizer</h1>
      <p>Cfg given by:</p>
      <pre>
        {test ? print(test) : err instanceof Error ? err.message : String(err)}
      </pre>
    </>
  );
}

export default App;
