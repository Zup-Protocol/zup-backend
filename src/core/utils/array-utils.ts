export function isArrayEmptyOrUndefined<T>(array: T[] | undefined): boolean {
  return !array || array.length === 0;
}
