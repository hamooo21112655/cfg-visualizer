import { createCfg } from "./cfg/cfg.service";
import { EPSILON, type Cfg } from "./cfg/types/cfg";
import {
  findGenerativeSymbols,
  findReachableSymbols,
  print,
  removeEpsilonProductions,
  removeUselessSymbols,
  unit,
} from "./cfg/utils/grammar-operations.utils";

function App() {
  const cfg: Cfg = {
    terminals: new Set(["w", "1", "2"]),
    nonTerminals: new Set(["A", "B", "C", "D"]),
    startSymbol: "A",
    productionRules: {
      A: [["B"]],
      B: [["C"], ["w", "1"]],
      C: [["D"]],
      D: [["w", "2"]],
    },
  };

  console.log(unit(cfg, "A"));

  return (
    <>
      <h1>Context-free grammar visualizer</h1>
      <p>Unit(A):</p>
      <pre>{unit(cfg, "A")}</pre>
      {/* <p>Cfg after removal of empty prods:</p>
      <pre>
        {test
          ? print(removeEpsilonProductions(test))
          : err instanceof Error
            ? err.message
            : String(err)}
      </pre> */}
    </>
  );
}

export default App;
