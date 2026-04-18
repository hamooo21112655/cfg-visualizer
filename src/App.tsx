import { createCfg } from "./cfg/cfg.service";
import type { Cfg } from "./cfg/types/cfg";
import {
  findGenerativeSymbols,
  findReachableSymbols,
  print,
  removeUselessSymbols,
} from "./cfg/utils/grammar-operations.utils";

function App() {
  let test: Cfg | null = null;
  let err: unknown = null;

  try {
    test = createCfg(
      new Set(["a", "b", "c"]), // terminals
      new Set(["S", "A", "B", "C"]), // non-terminals
      {
        S: [
          ["A", "a"],
          ["a", "B", "b"],
        ],
        A: [["b", "A", "b"]],
        B: [["b", "B", "b"], ["A"], ["a"]],
        C: [["a"], ["c"]],
      },
      "S",
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
      <p>Cfg after removing non generative symbols:</p>
      <pre>{print(removeUselessSymbols(test!))}</pre>
    </>
  );
}

export default App;
