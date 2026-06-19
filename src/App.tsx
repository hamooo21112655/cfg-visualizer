import { isWordProducedByGrammar } from "./cfg/cfg.service";
import { EPSILON, type Cfg } from "./cfg/types/cfg";
import {
  print,
  removeUnitProductions,
} from "./cfg/utils/grammar-operations.utils";

function App() {
  // const cfg: Cfg = {
  //   terminals: new Set(["a", "b"]),
  //   nonTerminals: new Set(["S"]),
  //   startSymbol: "S",
  //   productionRules: {
  //     S: [["a", "S", "a"], ["b", "S", "b"], ["a"], ["b"], [EPSILON]],
  //   },
  // };

  const cfg: Cfg = {
    terminals: new Set(["a", "b"]),
    nonTerminals: new Set(["S", "A", "B", "C"]),
    startSymbol: "S",
    productionRules: {
      S: [
        ["A", "B"],
        ["B", "C"],
      ],
      A: [["B", "A"], ["a"]],
      B: [["C", "C"], ["b"]],
      C: [["A", "B"], ["a"]],
    },
  };

  isWordProducedByGrammar(["b", "a", "a", "b", "a"], cfg);

  return (
    <>
      <h1>Context-free grammar visualizer</h1>
      <p>Before reduction to chomsky:</p>
      <pre>{print(cfg)}</pre>
      <p>After reduction to chomsky:</p>
      <pre>{print(removeUnitProductions(cfg))}</pre>
    </>
  );
}

export default App;
