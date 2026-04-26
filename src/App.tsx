import { createCfg } from "./cfg/cfg.service";
import { EPSILON, type Cfg } from "./cfg/types/cfg";
import {
  findGenerativeSymbols,
  findReachableSymbols,
  print,
  removeEpsilonProductions,
  removeUselessSymbols,
} from "./cfg/utils/grammar-operations.utils";

function App() {
  let test: Cfg | null = null;
  let err: unknown = null;

  try {
    test = createCfg(
      new Set(["a", "b", "c"]), // terminals
      new Set(["S", "A", "B", "C", "D", "E"]), // non-terminals
      {
        S: [["A", "B", "C", "D"], ["E"]],
        A: [["a"], [EPSILON]],
        B: [["b"], ["c"]],
        C: [["b"], [EPSILON]],
        D: [["a"], ["b"]],
        E: [["a"], ["b"], [EPSILON]],
      },
      "S",
    );
  } catch (error) {
    err = error;
  }

  return (
    <>
      <h1>Context-free grammar visualizer</h1>
      <p>Cfg before removal of empty prods:</p>
      <pre>
        {test ? print(test) : err instanceof Error ? err.message : String(err)}
      </pre>
      <p>Cfg after removal of empty prods:</p>
      <pre>
        {test
          ? print(removeEpsilonProductions(test))
          : err instanceof Error
            ? err.message
            : String(err)}
      </pre>
    </>
  );
}

export default App;
