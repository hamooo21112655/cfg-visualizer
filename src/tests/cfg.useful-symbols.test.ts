import { describe, it, expect } from "vitest";
import { EPSILON, type Cfg } from "../cfg/types/cfg";
import {
  findEmptySymbols,
  findGenerativeSymbols,
  findReachableSymbols,
  unit,
  print,
  removeEpsilonProductions,
  removeUnitProductions,
  removeUselessSymbols,
} from "../cfg/utils/grammar-operations.utils";
import {
  grammarReducedToCNF,
  grammarWithoutEpsilonProductions,
  grammarWithoutUnitProductions,
  grammarWithoutUselessSymbols,
} from "../cfg/cfg.service";

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

const cfgWithEpsilon1: Cfg = {
  terminals: new Set(["a"]),
  nonTerminals: new Set(["S", "A"]),
  startSymbol: "S",
  productionRules: {
    S: [["A"]],
    A: [[EPSILON], ["a"]],
  },
};

// Recursive nullable grammar
const cfgWithEpsilon2: Cfg = {
  terminals: new Set(["a"]),
  nonTerminals: new Set(["S", "A"]),
  startSymbol: "S",
  productionRules: {
    S: [["A"]],
    A: [["S"], [EPSILON]],
  },
};

// Grammar with unreachable nullable symbol
const cfgWithEpsilon3: Cfg = {
  terminals: new Set(["a"]),
  nonTerminals: new Set(["S", "A", "B"]),
  startSymbol: "S",
  productionRules: {
    S: [["a"]],
    A: [[EPSILON]],
    B: [["A"]],
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

describe("findGenerativeSymbols with epsilon", () => {
  it("should treat epsilon-producing symbols as generative", () => {
    const result = findGenerativeSymbols(cfgWithEpsilon1);

    expect(result.sort()).toEqual(["A", "S"].sort());
  });

  it("should handle recursive epsilon-generative symbols", () => {
    const result = findGenerativeSymbols(cfgWithEpsilon2);

    expect(result.sort()).toEqual(["A", "S"].sort());
  });

  it("should include unreachable but generative symbols", () => {
    const result = findGenerativeSymbols(cfgWithEpsilon3);

    expect(result.sort()).toEqual(["A", "B", "S"].sort());
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

/*****************************************************************************/
/*                            findEmptySymbols                               */
/*****************************************************************************/

describe("findEmptySymbols", () => {
  it("should return nonterminals that directly produce ε", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S", "A"]),
      terminals: new Set(["a"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [[EPSILON]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result.sort()).toEqual(["A", "S"].sort());
  });

  it("should handle no empty productions", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S", "A"]),
      terminals: new Set(["a"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [["a"]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result).toEqual([]);
  });

  it("should propagate emptiness through multiple levels", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S", "A", "B"]),
      terminals: new Set(["a"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [["B"]],
        B: [[EPSILON]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result.sort()).toEqual(["S", "A", "B"].sort());
  });

  it("should detect combinations of empty symbols", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S", "A", "B"]),
      terminals: new Set(["a"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "B"]],
        A: [[EPSILON]],
        B: [[EPSILON]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result.sort()).toEqual(["S", "A", "B"].sort());
  });

  it("should not mark symbol empty if one dependency is not empty", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S", "A", "B"]),
      terminals: new Set(["a"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "B"]],
        A: [[EPSILON]],
        B: [["b"]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result).toEqual(["A"]);
  });

  it("should handle self-referencing productions correctly", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S"]),
      terminals: new Set(["a"]),
      startSymbol: "S",
      productionRules: {
        S: [["S"], [EPSILON]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result).toEqual(["S"]);
  });

  it("should handle complex mixed grammar", () => {
    const cfg: Cfg = {
      nonTerminals: new Set(["S", "A", "B", "C"]),
      terminals: new Set(["a", "b"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "B"], ["C"]],
        A: [[EPSILON]],
        B: [["b"]],
        C: [["A"]],
      },
    };

    const result = findEmptySymbols(cfg);

    expect(result.sort()).toEqual(["S", "A", "C"].sort());
  });
});

/*****************************************************************************/
/*                     grammarWithoutEpsilonProductions                      */
/*****************************************************************************/

describe("grammarWithoutEpsilonProductions", () => {
  it("should remove direct epsilon productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [[EPSILON], ["a"]],
      },
    };

    const result = grammarWithoutEpsilonProductions(cfg);

    expect(result.productionRules["A"]).toEqual([["a"]]);
  });

  it("should preserve grammar metadata", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["S", "A"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [["a"]],
      },
    };

    const result = grammarWithoutEpsilonProductions(cfg);

    expect(result.terminals).toEqual(new Set(["a", "b"]));
    expect(result.nonTerminals).toEqual(new Set(["S", "A"]));
    expect(result.startSymbol).toBe("S");
  });

  it("should create alternative productions when nullable symbol appears", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "a"]],
        A: [[EPSILON]],
      },
    };

    const result = grammarWithoutEpsilonProductions(cfg);

    expect(result.productionRules["S"]).toEqual(
      expect.arrayContaining([["A", "a"], ["a"]]),
    );
  });

  it("should handle chain nullable symbols", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A", "B"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "B"]],
        A: [[EPSILON]],
        B: [["a"], [EPSILON]],
      },
    };

    const result = grammarWithoutEpsilonProductions(cfg);

    expect(result.productionRules["S"]).toEqual(
      expect.arrayContaining([["A", "B"], ["A"], ["B"]]),
    );
  });

  it("should not mutate original grammar", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [[EPSILON], ["a"]],
      },
    };

    const original = structuredClone(cfg);

    grammarWithoutEpsilonProductions(cfg);

    expect(cfg).toEqual(original);
  });

  it("should return same grammar when no epsilon productions exist", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [["a"]],
      },
    };

    const result = grammarWithoutEpsilonProductions(cfg);

    expect(result.productionRules).toEqual(cfg.productionRules);
  });
});

/*****************************************************************************/
/*                                  unit                                     */
/*****************************************************************************/

describe("unit()", () => {
  it("should follow a simple chain of unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["w", "1", "2"]),
      nonTerminals: new Set(["A", "B", "C", "D"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["C"]],
        C: [["D"]],
        D: [["w", "2"]],
      },
    };

    const result = unit(cfg, "A");

    expect(new Set(result)).toEqual(new Set(["A", "B", "C", "D"]));
  });

  it("should stop when non-unit production is reached", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["a"]],
      },
    };

    const result = unit(cfg, "A");

    expect(new Set(result)).toEqual(new Set(["A", "B"]));
  });

  it("should handle branching unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B", "C"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"], ["C"]],
        B: [["a"]],
        C: [["a"]],
      },
    };

    const result = unit(cfg, "A");

    expect(new Set(result)).toEqual(new Set(["A", "B", "C"]));
  });

  it("should handle cycles without infinite loop", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["A"]],
      },
    };

    const result = unit(cfg, "A");

    expect(new Set(result)).toEqual(new Set(["A", "B"]));
  });

  it("should return only the symbol if no unit productions exist", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A"]),
      startSymbol: "A",
      productionRules: {
        A: [["a"]],
      },
    };

    const result = unit(cfg, "A");

    expect(result).toEqual(["A"]);
  });

  it("should ignore non-unit productions mixed with unit ones", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"], ["a"]],
        B: [["b"]],
      },
    };

    const result = unit(cfg, "A");

    expect(new Set(result)).toEqual(new Set(["A", "B"]));
  });

  it("should not include unreachable nonterminals", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B", "C"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["a"]],
        C: [["A"]],
      },
    };

    const result = unit(cfg, "A");

    expect(new Set(result)).toEqual(new Set(["A", "B"]));
  });
});

/*****************************************************************************/
/*                       grammarWithoutUnitProductions                       */
/*****************************************************************************/

describe("grammarWithoutUnitProductions()", () => {
  it("should remove a simple unit production", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["a"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules).toEqual({
      A: [["a"]],
    });
  });

  it("should remove chains of unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B", "C"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["C"]],
        C: [["a"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules).toEqual({
      A: [["a"]],
    });
  });

  it("should preserve non-unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"], ["a"]],
        B: [["b"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules["A"]).toEqual(
      expect.arrayContaining([["a"], ["b"]]),
    );

    expect(result.productionRules["A"]).not.toContainEqual(["B"]);
  });

  it("should handle branching unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["S", "A", "B"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"], ["B"]],
        A: [["a"]],
        B: [["b"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules["S"]).toEqual(
      expect.arrayContaining([["a"], ["b"]]),
    );

    expect(result.productionRules["S"]).not.toContainEqual(["A"]);
    expect(result.productionRules["S"]).not.toContainEqual(["B"]);
  });

  it("should remove duplicate productions after elimination", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"], ["a"]],
        B: [["a"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules["A"]).toEqual([["a"]]);
  });

  it("should handle cyclic unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["A"], ["a"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules).toEqual({
      A: [["a"]],
    });
  });

  it("should leave grammar unchanged if no unit productions exist", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["a"], ["b", "B"]],
        B: [["b"]],
      },
    };

    const result = grammarWithoutUnitProductions(cfg);

    expect(result.productionRules).toEqual(cfg.productionRules);
  });

  it("should not mutate the original grammar", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["A", "B"]),
      startSymbol: "A",
      productionRules: {
        A: [["B"]],
        B: [["a"]],
      },
    };

    const original = structuredClone(cfg);

    grammarWithoutUnitProductions(cfg);

    expect(cfg).toEqual(original);
  });
});

/*****************************************************************************/
/*                          grammarReducedToCNF                              */
/*****************************************************************************/

describe("grammarReducedToCNF()", () => {
  it("should replace terminals in long productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["S"]),
      startSymbol: "S",
      productionRules: {
        S: [["a", "b"]],
      },
    };

    const result = grammarReducedToCNF(cfg);

    expect(Object.values(result.productionRules).flat()).toContainEqual([
      "T_0",
      "T_1",
    ]);

    expect(result.productionRules["T_0"]).toEqual([["a"]]);
    expect(result.productionRules["T_1"]).toEqual([["b"]]);
  });

  it("should split productions longer than 2 symbols", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b", "c"]),
      nonTerminals: new Set(["S"]),
      startSymbol: "S",
      productionRules: {
        S: [["a", "b", "c"]],
      },
    };

    const result = grammarReducedToCNF(cfg);

    const allProductions = Object.values(result.productionRules).flat();

    allProductions.forEach((production: string[]) => {
      expect(production.length).toBeLessThanOrEqual(2);
    });
  });

  it("should remove unit productions", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A", "B"]),
      startSymbol: "S",
      productionRules: {
        S: [["A"]],
        A: [["B"]],
        B: [["a"]],
      },
    };

    const result = grammarReducedToCNF(cfg);

    Object.values(result.productionRules)
      .flat()
      .forEach((production: string[]) => {
        const isUnitProduction =
          production.length === 1 && result.nonTerminals.has(production[0]);

        expect(isUnitProduction).toBe(false);
      });
  });

  it("should remove useless symbols", () => {
    const cfg: Cfg = {
      terminals: new Set(["a"]),
      nonTerminals: new Set(["S", "A", "B"]),
      startSymbol: "S",
      productionRules: {
        S: [["a"]],
        A: [["B"]],
        B: [["A"]],
      },
    };

    const result = grammarReducedToCNF(cfg);

    expect(result.nonTerminals.has("A")).toBe(false);
    expect(result.nonTerminals.has("B")).toBe(false);
  });

  it("should preserve already valid CNF grammar", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["S", "A", "B"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "B"]],
        A: [["a"]],
        B: [["b"]],
      },
    };

    const result = grammarReducedToCNF(cfg);

    expect(result.productionRules).toEqual(cfg.productionRules);
  });

  it("should ensure every production satisfies CNF", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b", "c"]),
      nonTerminals: new Set(["S", "A"]),
      startSymbol: "S",
      productionRules: {
        S: [["A", "b", "c"], ["a"]],
        A: [[EPSILON], ["a"]],
      },
    };

    const result = grammarReducedToCNF(cfg);

    Object.values(result.productionRules)
      .flat()
      .forEach((production: string[]) => {
        const isTerminalProduction =
          production.length === 1 && result.terminals.has(production[0]);

        const isBinaryNonterminalProduction =
          production.length === 2 &&
          production.every((symbol: string) => result.nonTerminals.has(symbol));

        expect(isTerminalProduction || isBinaryNonterminalProduction).toBe(
          true,
        );
      });
  });

  it("should not mutate the original grammar", () => {
    const cfg: Cfg = {
      terminals: new Set(["a", "b"]),
      nonTerminals: new Set(["S"]),
      startSymbol: "S",
      productionRules: {
        S: [["a", "b", "a"]],
      },
    };

    const original = structuredClone(cfg);

    grammarReducedToCNF(cfg);

    expect(cfg).toEqual(original);
  });
});
