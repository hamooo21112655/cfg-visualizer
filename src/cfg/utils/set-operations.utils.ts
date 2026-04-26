export const intersection = <T>(A: Set<T> | T[], B: Set<T> | T[]): Set<T> =>
  new Set<T>([...A].filter((member) => [...B].includes(member)));

export const union = <T>(A: Set<T>, B: Set<T>): Set<T> =>
  new Set<T>([...A, ...B]);

export const isMember = <T>(a: T, A: Set<T> | T[]): boolean =>
  [...A].includes(a);

export const isEmptySet = <T>(A: Set<T>): boolean => A.size === 0;

export const areDisjoint = <T>(A: Set<T> | T[], B: Set<T> | T[]): boolean =>
  isEmptySet(intersection(new Set([...A]), new Set([...B])));

export const isSubsetOf = <T>(A: Set<T> | T[], B: Set<T> | T[]): boolean =>
  new Set([...B]).size === union(new Set([...A]), new Set([...B])).size;

export const powerSet = (arr: any[]): any[] => {
  const result = [[]];

  for (const elem of arr) {
    const newSubsets: any[] = result.map((subset) => [...subset, elem]);
    result.push(...newSubsets);
  }

  return result;
};
