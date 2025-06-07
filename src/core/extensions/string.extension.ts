export {};

declare global {
  interface String {
    lowercasedEquals(other: string): boolean;
  }
}

String.prototype.lowercasedEquals = function (
  this: string | undefined,
  other: string | undefined,
): boolean {
  if (this === undefined || other === undefined) {
    return false;
  }

  return this.toLowerCase() === other.toLowerCase();
};
