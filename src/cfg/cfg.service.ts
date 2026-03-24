import type { Terminal, Nonterminal, SymbolSequence, Cfg } from "./types/cfg";
import { validateCfg } from "./validations/create-cfg.validation";

export const createCfg = (
  terminals: Set<Terminal>,
  nonTerminals: Set<Nonterminal>,
  productionRules: Record<Nonterminal, SymbolSequence[]>,
  startSymbol?: Nonterminal,
): Cfg => {
  const cfg: Cfg = {
    terminals,
    nonTerminals,
    startSymbol,
    productionRules,
  };

  const cfgValidated: Cfg = validateCfg(cfg);
  return cfgValidated;
};
