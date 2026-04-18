import type { Cfg } from "../types/cfg";
import { intersection, isEmptySet } from "../utils/set-operations.utils";

export const validateCfg = (cfg: Cfg) => {
  const intersect: Set<any> = intersection(cfg.terminals, cfg.nonTerminals);
  if (!isEmptySet(intersect)) {
    throw new Error("Terminals and nonterminals may not contain same symbols!");
  }
  return cfg;
};

// dodati validaciju da samo simboli navedeni u skupu neterminalnih ili terminalnih simbolaS
// smiju stajati na desnoj strani produkcija
