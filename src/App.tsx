import type { Cfg } from "./cfg/types/cfg";

function App() {
  const test: Cfg = {
    terminals: new Set(["A", "B"]),
    nonTerminals: new Set(["A", "B"]),
    startSymbol: "A",
    productionRules: { A: [["a", "b"]] },
    print: () => console.log("test"),
  };

  test.print();

  return <h1>Context-free grammar visualizer</h1>;
}

export default App;
