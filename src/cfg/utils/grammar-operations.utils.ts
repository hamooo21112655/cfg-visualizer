import { createCfg } from "../cfg.service";
import { EPSILON, type Cfg } from "../types/cfg";
import { isMember, isSubsetOf, powerSet, union } from "./set-operations.utils";

/*****************************************************************************/
/*                           BASIC OPERATIONS                                */
/*****************************************************************************/

export const getNonterminalsSorted = (cfg: Cfg): string[] =>
  [...cfg.nonTerminals].sort();

export const getTerminalsSorted = (cfg: Cfg): string[] =>
  [...cfg.terminals].sort();

export const getRightSideOfProductionForNonterminal = (
  cfg: Cfg,
  nonTerminal: string,
): string[][] => cfg.productionRules[nonTerminal];

export const getNonterminalsOnTheLeftSideOfProductionRules = (
  cfg: Cfg,
): string[] => Object.keys(cfg.productionRules);

export const isTerminal = (cfg: Cfg, symbol: string) => {
  return cfg.terminals.has(symbol);
};

export const isNonterminal = (cfg: Cfg, symbol: string) => {
  return cfg.nonTerminals.has(symbol);
};

const printRulesForOneNonterminal = (cfg: Cfg, nonTerminal: string): string =>
  `* ${nonTerminal} => ${getRightSideOfProductionForNonterminal(
    cfg,
    nonTerminal,
  )
    .map((rightSide: string[]) => rightSide.join(""))
    .join(" | ")}`;

export const print = (cfg: Cfg): string =>
  `Terminals: [${getTerminalsSorted(cfg).join(", ")}]
Nonterminals: [${getNonterminalsSorted(cfg).join(", ")}]
Production rules: 
${getNonterminalsOnTheLeftSideOfProductionRules(cfg)
  .sort()
  .map((nonTerminal: string) => printRulesForOneNonterminal(cfg, nonTerminal))
  .join("\n")}
Start symbol: ${cfg.startSymbol}`;

const productionContainsOnlyEpsilon = (
  rightSideOfProduction: string[],
): boolean =>
  rightSideOfProduction.length === 1 && rightSideOfProduction[0] === EPSILON;

/*****************************************************************************/
/*                       REMOVAL OF USELESS SYMBOLS                          */
/*****************************************************************************/

const initialListOfGeneratives = (cfg: Cfg): string[] =>
  getNonterminalsOnTheLeftSideOfProductionRules(cfg).filter(
    (terminal: string) =>
      cfg.productionRules[terminal].some((rightSideOfProduction: string[]) =>
        rightSideOfProduction.every((symbol: string) =>
          isTerminal(cfg, symbol),
        ),
      ),
  );

export const findGenerativeSymbols = (cfg: Cfg): string[] => {
  let oldSetOfGeneratives: Set<string> = new Set([]);
  let newSetOfGeneratives: Set<string> = new Set(initialListOfGeneratives(cfg));

  while (oldSetOfGeneratives.size !== newSetOfGeneratives.size) {
    oldSetOfGeneratives = newSetOfGeneratives;
    newSetOfGeneratives = union(
      newSetOfGeneratives,
      new Set(
        getNonterminalsOnTheLeftSideOfProductionRules(cfg).filter(
          (terminal: string) =>
            cfg.productionRules[terminal].some(
              (rightSideOfProduction: string[]) =>
                rightSideOfProduction.every(
                  (symbol: string) =>
                    isTerminal(cfg, symbol) ||
                    isMember(symbol, oldSetOfGeneratives),
                ),
            ),
        ),
      ),
    );
  }
  return [...newSetOfGeneratives];
};

export const findReachableSymbols = (cfg: Cfg): string[] => {
  let oldSetOfReachables: Set<string> = new Set([]);
  let newSetOfReachables: Set<string> = new Set([cfg.startSymbol]);

  while (oldSetOfReachables.size !== newSetOfReachables.size) {
    oldSetOfReachables = newSetOfReachables;
    newSetOfReachables = union(
      oldSetOfReachables,
      new Set(
        [...newSetOfReachables]
          .map((symbol: string) => {
            if (isTerminal(cfg, symbol)) return symbol;
            else {
              return (
                getRightSideOfProductionForNonterminal(cfg, symbol) ?? []
              ).flat();
            }
          })
          .flat(),
      ),
    );
  }

  return [...newSetOfReachables];
};

export const removeUselessSymbols = (cfg: Cfg): any => {
  const generatives: string[] = findGenerativeSymbols(cfg);

  for (const nonTerminals of [...cfg.nonTerminals].filter(
    (symbol: string) => !generatives.includes(symbol),
  )) {
    delete cfg.productionRules[nonTerminals];
  }

  generatives.forEach((nonTerminal: string) => {
    cfg.productionRules[nonTerminal] = cfg.productionRules[nonTerminal].filter(
      (rightSideOfProduction: string[]) => {
        const extractNonTerminals: string[] = rightSideOfProduction.filter(
          (symbol: string) => isNonterminal(cfg, symbol),
        );
        return isSubsetOf(extractNonTerminals, generatives);
      },
    );
  });

  cfg.nonTerminals = new Set(generatives);

  const reachables: string[] = findReachableSymbols(cfg);

  for (const nonTerminal of [...cfg.nonTerminals].filter(
    (symbol: string) => !reachables.includes(symbol),
  )) {
    delete cfg.productionRules[nonTerminal];
  }

  cfg.nonTerminals = new Set(
    reachables.filter((symbol: string) => isNonterminal(cfg, symbol)),
  );

  cfg.terminals = new Set(
    reachables.filter((symbol: string) => isTerminal(cfg, symbol)),
  );

  return cfg;
};

/*****************************************************************************/
/*                       REMOVAL OF EPSILON PRODUCTIONS                      */
/*****************************************************************************/

export const findEmptySymbols = (cfg: Cfg): string[] => {
  let oldSetOfEmpties: Set<string> = new Set([]);
  let newSetOfEmpties: Set<string> = new Set(
    [...cfg.nonTerminals].filter((nonterminal: string) =>
      cfg.productionRules[nonterminal].some(
        (rightSideOfProduction: string[]) =>
          rightSideOfProduction.length === 1 &&
          rightSideOfProduction[0] === EPSILON,
      ),
    ),
  );

  while (oldSetOfEmpties.size !== newSetOfEmpties.size) {
    oldSetOfEmpties = newSetOfEmpties;
    newSetOfEmpties = union(
      oldSetOfEmpties,
      new Set(
        [...cfg.nonTerminals].filter((nonterminal: string) =>
          cfg.productionRules[nonterminal].some(
            (rightSideOfProduction: string[]) =>
              isSubsetOf(rightSideOfProduction, [...oldSetOfEmpties, EPSILON]),
          ),
        ),
      ),
    );
  }

  return [...newSetOfEmpties];
};

export const removeEpsilonProductions = (cfg: Cfg): Cfg => {
  const emptySymbols: string[] = findEmptySymbols(cfg);

  const cfgWithoutEpsilonProductions: Cfg = createCfg(
    cfg.terminals,
    cfg.nonTerminals,
    {},
    cfg.startSymbol,
  );

  cfg.nonTerminals.forEach((nonTerminal: string) => {
    cfgWithoutEpsilonProductions.productionRules[nonTerminal] = [];
    cfg.productionRules[nonTerminal].forEach(
      (rightSideOfProduction: string[]) => {
        if (productionContainsOnlyEpsilon(rightSideOfProduction)) {
          return;
        }

        const nullSymbolPositions: (number | null)[] = rightSideOfProduction
          .map((symbol: string, index: number) =>
            emptySymbols.includes(symbol) ? index : null,
          )
          .filter((indexOrNull: number | null) => indexOrNull !== null);

        const positionCombinations = powerSet(nullSymbolPositions);

        positionCombinations.forEach((combination: number[]) => {
          const newProduction: string[] = rightSideOfProduction.filter(
            (_: string, index: number) => !combination.includes(index),
          );

          if (newProduction.length === 0) return;

          cfgWithoutEpsilonProductions.productionRules[nonTerminal] = [
            ...cfgWithoutEpsilonProductions.productionRules[nonTerminal],
            newProduction,
          ];
        });
      },
    );
    if (
      cfgWithoutEpsilonProductions.productionRules[nonTerminal].length === 0
    ) {
      delete cfgWithoutEpsilonProductions.productionRules[nonTerminal];
    }
  });

  if (isMember(cfg.startSymbol, emptySymbols))
    cfgWithoutEpsilonProductions.productionRules[cfg.startSymbol] = [
      ...cfgWithoutEpsilonProductions.productionRules[cfg.startSymbol],
      [EPSILON],
    ];
  return cfgWithoutEpsilonProductions;
};
