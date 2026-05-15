import { createCfg, grammarWithoutUnitProductions } from "./cfg/cfg.service";
import { EPSILON, type Cfg } from "./cfg/types/cfg";
import {
  findGenerativeSymbols,
  findReachableSymbols,
  print,
  reduceToChomskyNormalForm,
  removeEpsilonProductions,
  removeUnitProductions,
  removeUselessSymbols,
  unit,
} from "./cfg/utils/grammar-operations.utils";

function App() {
  const cfg: Cfg = {
    terminals: new Set(["a"]),
    nonTerminals: new Set(["S", "A"]),
    startSymbol: "S",
    productionRules: {
      S: [["a"]],
      A: [["a"]],
    },
  };

  // console.log(grammarWithoutUnitProductions(cfg).productionRules);

  return (
    <>
      <h1>Context-free grammar visualizer</h1>
      <p>Before reduction to chomsky:</p>
      <pre>{print(cfg)}</pre>
      <p>After reduction to chomsky:</p>
      <pre>{print(removeUnitProductions(cfg))}</pre>
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
