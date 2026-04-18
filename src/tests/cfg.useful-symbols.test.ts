import { describe, it, expect } from "vitest";
import type { Cfg } from "../cfg/types/cfg";
import {
  findGenerativeSymbols,
  findReachableSymbols,
} from "../cfg/utils/grammar-operations.utils";
import { grammarWithoutUselessSymbols } from "../cfg/cfg.service";

/*****************************************************************************/
/*                                TEST CFGs                                  */
/*****************************************************************************/

// Simple CFG
const cfg1: Cfg = {
  terminals: new Set(["a", "b"]),
  nonTerminals: new Set(["S", "A", "B"]),
  startSymbol: "S",
  productionRules: {
    S: [["A", "B"]],
    A: [["a"]],
    B: [["b"]],
  },
};

// CFG with non-generative symbol
const cfg2: Cfg = {
  terminals: new Set(["a"]),
  nonTerminals: new Set(["S", "A", "B"]),
  startSymbol: "S",
  productionRules: {
    S: [["A"]],
    A: [["B"]],
    B: [["B"]], // never produces terminals
  },
};

// CFG with unreachable symbol
const cfg3: Cfg = {
  terminals: new Set(["a"]),
  nonTerminals: new Set(["S", "A", "B"]),
  startSymbol: "S",
  productionRules: {
    S: [["A"]],
    A: [["a"]],
    B: [["a"]], // unreachable
  },
};

// CFG with mixed recursion
const cfg4: Cfg = {
  terminals: new Set(["a"]),
  nonTerminals: new Set(["S", "A"]),
  startSymbol: "S",
  productionRules: {
    S: [["A"]],
    A: [["S"], ["a"]],
  },
};

/*****************************************************************************/
/*                         findGenerativeSymbols                             */
/*****************************************************************************/

describe("findGenerativeSymbols", () => {
  it("should find all generative symbols in simple CFG", () => {
    const result = findGenerativeSymbols(cfg1);
    expect(result.sort()).toEqual(["A", "B", "S"]);
  });

  it("should exclude non-generative symbols", () => {
    const result = findGenerativeSymbols(cfg2);
    expect(result).toEqual([]); // none can derive terminals
  });

  it("should handle recursive generative symbols", () => {
    const result = findGenerativeSymbols(cfg4);
    expect(result.sort()).toEqual(["A", "S"]);
  });
});

/*****************************************************************************/
/*                         findReachableSymbols                              */
/*****************************************************************************/

describe("findReachableSymbols", () => {
  it("should find all reachable symbols", () => {
    const result = findReachableSymbols(cfg1);
    expect(result.sort()).toEqual(["A", "B", "S", "a", "b"].sort());
  });

  it("should exclude unreachable symbols", () => {
    const result = findReachableSymbols(cfg3);
    expect(result.sort()).toEqual(["S", "A", "a"].sort());
  });

  it("should include terminals encountered along the way", () => {
    const result = findReachableSymbols(cfg4);
    expect(result.sort()).toEqual(["S", "A", "a"].sort());
  });

  it("should at least include start symbol", () => {
    const result = findReachableSymbols({
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S"]),
      startSymbol: "S",
      productionRules: {},
    });

    expect(result).toContain("S");
  });
});

/*****************************************************************************/
/*                         removeUselessSymbols                              */
/*****************************************************************************/

describe("grammarWithoutUselessSymbols", () => {
  const grammar: Cfg = {
    nonTerminals: new Set(["S", "A", "B", "C"]),
    terminals: new Set(["a", "b", "c"]),
    productionRules: {
      S: [
        ["A", "a"],
        ["a", "B", "b"],
      ],
      A: [["b", "A", "b"]],
      B: [["b", "B", "b"], ["A"], ["a"]],
      C: [["a"], ["c"]],
    },
    startSymbol: "S",
  };
  const grammarWithNoUselessSymbols: Cfg =
    grammarWithoutUselessSymbols(grammar);

  it("should remove all useless nonterminals", () => {
    expect([...grammarWithNoUselessSymbols.nonTerminals].sort()).toEqual([
      "B",
      "S",
    ]);
  });

  it("should remove all useless terminals", () => {
    expect([...grammarWithNoUselessSymbols.terminals].sort()).toEqual([
      "a",
      "b",
    ]);
  });

  it("should remove all uproductions with useless symbols", () => {
    expect(grammarWithNoUselessSymbols.productionRules).toEqual({
      S: [["a", "B", "b"]],
      B: [["b", "B", "b"], ["a"]],
    });
  });
});
