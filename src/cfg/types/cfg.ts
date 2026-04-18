export interface Cfg {
  terminals: Set<string>;
  nonTerminals: Set<string>;
  productionRules: Record<string, string[][]>;
  startSymbol: string;
}

export const EPSILON = "ɛ";
