export const groupBy = <T>(
  array: T[],
  keyGetter: (item: T) => string | number | symbol,
): Record<string | number | symbol, T[]> => {
  return array.reduce(
    (acc, item) => {
      const key = keyGetter(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string | number | symbol, T[]>,
  );
};
