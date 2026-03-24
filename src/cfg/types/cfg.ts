export interface Cfg {
  terminals: Set<Terminal>;
  nonTerminals: Set<Nonterminal>;
  productionRules: Record<Nonterminal, SymbolSequence[]>;
  startSymbol?: Nonterminal;
}

export type Terminal = string;
export type Nonterminal = string;
export type SymbolSequence = (Terminal | Nonterminal)[];

export const EPSILON = "ɛ";
