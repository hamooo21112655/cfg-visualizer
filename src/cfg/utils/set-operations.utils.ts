export const intersection = (A: Set<any>, B: Set<any>): Set<any> =>
  new Set<any>([...A].filter((member) => [...B].includes(member)));

export const union = (A: Set<any>, B: Set<any>): Set<any> =>
  new Set<any>([...A, ...B]);

export const isMember = <T>(a: T, A: Set<T>): boolean => [...A].includes(a);

export const isEmptySet = <T>(A: Set<T>): boolean => A.size === 0;

export const areDisjoint = (
  A: Set<any> | any[],
  B: Set<any> | any[],
): boolean => isEmptySet(intersection(new Set([...A]), new Set([...B])));

export const isSubsetOf = (A: Set<any> | any[], B: Set<any> | any[]): boolean =>
  new Set([...B]).size === union(new Set([...A]), new Set([...B])).size;
