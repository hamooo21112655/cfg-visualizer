import type { Cfg, Nonterminal, SymbolSequence, Terminal } from "../types/cfg";
import { setAsArray } from "./set-operations.utils";

/**********************BASIC OPERATIONS***************************************/

export const getNonterminalsSorted = (cfg: Cfg): Nonterminal[] =>
  setAsArray(cfg.nonTerminals).sort();

export const getTerminalsSorted = (cfg: Cfg): Terminal[] =>
  setAsArray(cfg.terminals).sort();

export const getRightSideOfProductionForNonterminal = (
  cfg: Cfg,
  nonTerminal: Nonterminal,
): SymbolSequence[] => cfg.productionRules[nonTerminal];

export const getNonterminalsOnTheLeftSideOfProductionRules = (
  cfg: Cfg,
): Nonterminal[] => Object.keys(cfg.productionRules);

const printRulesForOneNonterminal = (
  cfg: Cfg,
  nonTerminal: Nonterminal,
): string =>
  `* ${nonTerminal} => ${getRightSideOfProductionForNonterminal(
    cfg,
    nonTerminal,
  )
    .map((rightSide) => rightSide.join(""))
    .join(" | ")}`;

export const print = (cfg: Cfg): string =>
  `Terminals: [${getTerminalsSorted(cfg).join(", ")}]
Nonterminals: [${getNonterminalsSorted(cfg).join(", ")}]
Production rules: 
${getNonterminalsOnTheLeftSideOfProductionRules(cfg)
  .sort()
  .map((nonTerminal) => printRulesForOneNonterminal(cfg, nonTerminal))
  .join("\n")}
Start symbol: ${cfg.startSymbol}`;
