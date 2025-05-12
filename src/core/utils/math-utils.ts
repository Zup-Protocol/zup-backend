export function calculateDayPoolAPR(tvl: number, fees: number): number {
  return (fees / tvl) * 100 * 365;
}

export const average = (arr: number[]) =>
  arr.length === 0 ? 0 : arr.reduce((a, b) => a + b) / arr.length;
