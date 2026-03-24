export const intersection = (A: Set<any>, B: Set<any>): Set<any> =>
  new Set<any>([...A].filter((member) => [...B].includes(member)));

export const union = (A: Set<any>, B: Set<any>): Set<any> =>
  new Set<any>([...A, ...B]);

export const isMember = <T>(a: T, A: Set<T>): boolean => [...A].includes(a);

export const isEmptySet = <T>(A: Set<T>): boolean => A.size === 0;

export const arrayAsSet = <T>(arr: T[]) => new Set([...arr]);

export const setAsArray = <T>(set: Set<T>) => [...set];
