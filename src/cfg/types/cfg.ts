export interface Cfg {
  terminals: Set<Terminal>;
  nonTerminals: Set<Nonterminal>;
  productionRules: Record<Nonterminal, SymbolSequence[]>;
  startSymbol: Nonterminal;
  print: () => void;
}

export type Terminal = string;
export type Nonterminal = string;
export type SymbolSequence = (Terminal | Nonterminal)[];
