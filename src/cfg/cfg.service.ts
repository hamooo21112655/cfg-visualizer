import type { Cfg } from "./types/cfg";
import {
  removeEpsilonProductions,
  removeUnitProductions,
  removeUselessSymbols,
} from "./utils/grammar-operations.utils";
import { validateCfg } from "./validations/create-cfg.validation";

export const createCfg = (
  terminals: Set<string>,
  nonTerminals: Set<string>,
  productionRules: Record<string, string[][]>,
  startSymbol: string,
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

export const grammarWithoutUselessSymbols = (cfg: Cfg): Cfg => {
  const grammarValidated = createCfg(
    cfg.terminals,
    cfg.nonTerminals,
    cfg.productionRules,
    cfg.startSymbol,
  );

  const grammarWithoutUselessSymbols = removeUselessSymbols(grammarValidated);
  return grammarWithoutUselessSymbols;
};

export const grammarWithoutEpsilonProductions = (cfg: Cfg): Cfg => {
  const grammarValidated = createCfg(
    cfg.terminals,
    cfg.nonTerminals,
    cfg.productionRules,
    cfg.startSymbol,
  );

  const grammarWithoutEpsilonProductions =
    removeEpsilonProductions(grammarValidated);
  return grammarWithoutEpsilonProductions;
};

export const grammarWithoutUnitProductions = (cfg: Cfg): Cfg => {
  const grammarValidated = createCfg(
    cfg.terminals,
    cfg.nonTerminals,
    cfg.productionRules,
    cfg.startSymbol,
  );

  // validate once again to remove potential duplicates from production rules
  const grammarWithoutUnitProductions = validateCfg(
    removeUnitProductions(grammarValidated),
  );
  return grammarWithoutUnitProductions;
};
