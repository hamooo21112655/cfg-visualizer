import { createCfg } from "../cfg.service";
import { EPSILON, type Cfg } from "../types/cfg";
import {
  areDisjoint,
  isMember,
  isSubsetOf,
  powerSet,
  union,
} from "./set-operations.utils";

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

export const removeDuplicatesOnRightSideOfProduction = (
  rightSide: string[][],
): string[][] => {
  const productionsStringified: Set<string> = new Set(
    rightSide ? rightSide.map((prod: string[]) => JSON.stringify(prod)) : [],
  );

  return [...productionsStringified].map((prod: string) => JSON.parse(prod));
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

/*****************************************************************************/
/*                       REMOVAL OF UNIT PRODUCTIONS                         */
/*****************************************************************************/

export const unit = (cfg: Cfg, symbol: string): string[] => {
  let oldSetOfUnits = new Set<string>();
  let newSetOfUnits = new Set<string>([symbol]);

  while (oldSetOfUnits.size !== newSetOfUnits.size) {
    oldSetOfUnits = new Set<string>([...newSetOfUnits]);
    newSetOfUnits = union(
      oldSetOfUnits,
      [...oldSetOfUnits]
        .map((unitSymbol: string) =>
          cfg.productionRules[unitSymbol]
            .filter(
              (rightSideOfProduction: string[]) =>
                rightSideOfProduction.length === 1 &&
                isNonterminal(cfg, rightSideOfProduction[0]),
            )
            .flat(),
        )
        .flat(),
    );
  }
  return [...newSetOfUnits];
};

// ne zaboraviti u servisu jos jednom pozvati funkciju za uklanjanje beskorisnih simbola nakon sto se uklone jedinicne produkcije

export const removeUnitProductions = (cfg: Cfg): Cfg => {
  const cfgWithoutUnitProductions: Cfg = createCfg(
    cfg.terminals,
    cfg.nonTerminals,
    {},
    cfg.startSymbol,
  );

  cfg.nonTerminals.forEach((symbol: string) => {
    const unitNonterminals: string[] = unit(cfg, symbol);

    const rightSideOfUnits: string[][] = unitNonterminals
      .map((symbolOnLeft1: string) =>
        getRightSideOfProductionForNonterminal(cfg, symbolOnLeft1).filter(
          (rightSideOfProd: string[]) =>
            rightSideOfProd.length !== 1 ||
            isTerminal(cfg, rightSideOfProd[0]) ||
            rightSideOfProd[0] === EPSILON,
        ),
      )
      .flat();

    cfgWithoutUnitProductions.productionRules[symbol] = [...rightSideOfUnits];
  });

  return cfgWithoutUnitProductions;
};

/*****************************************************************************/
/*                    REDUCTION TO CHOMSKY NORMAL FORM                       */
/*****************************************************************************/

export const reduceToChomskyNormalForm = (cfg: Cfg): Cfg => {
  const reducedCfg = createCfg(
    cfg.terminals,
    cfg.nonTerminals,
    cfg.productionRules,
    cfg.startSymbol,
  );
  let index = 0;

  getNonterminalsOnTheLeftSideOfProductionRules(cfg).forEach(
    (symbol: string) => {
      cfg.productionRules[symbol]
        .filter((prod: string[]) => prod.length > 1)
        .forEach((rightSideOfProd: string[], prodIndex: number) => {
          reducedCfg.productionRules[symbol][prodIndex] = rightSideOfProd.map(
            (prodSymbol: string) => {
              const replacementSymbol = `T_${index++}`;
              if (isTerminal(cfg, prodSymbol)) {
                reducedCfg.nonTerminals.add(replacementSymbol);
                reducedCfg.productionRules[replacementSymbol] = [[prodSymbol]];
                return replacementSymbol;
              } else {
                return prodSymbol;
              }
            },
          );
        });
    },
  );

  const finalReducedCfg = createCfg(
    reducedCfg.terminals,
    reducedCfg.nonTerminals,
    reducedCfg.productionRules,
    reducedCfg.startSymbol,
  );

  getNonterminalsOnTheLeftSideOfProductionRules(reducedCfg).forEach(
    (symbol: string) => {
      reducedCfg.productionRules[symbol]
        .filter((prod: string[]) => prod.length > 2)
        .forEach((rightSideOfProd: string[], prodIndex: number) => {
          let lengthyProd = [...rightSideOfProd];
          while (lengthyProd.length > 2) {
            const [firstSymbol, secondSymbol, ...restOfTheSymbols] =
              lengthyProd;

            const replacementSymbol = `T_${index++}`;

            finalReducedCfg.nonTerminals.add(replacementSymbol);
            finalReducedCfg.productionRules[replacementSymbol] = [
              [firstSymbol, secondSymbol],
            ];
            lengthyProd = [replacementSymbol, ...restOfTheSymbols];
          }

          finalReducedCfg.productionRules[symbol][prodIndex] = [
            `T_${index - 1}`,
            rightSideOfProd[rightSideOfProd.length - 1],
          ];
        });
    },
  );

  return finalReducedCfg;
};
