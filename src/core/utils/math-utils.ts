export function calculateDayPoolAPR(tvl: number, fees: number): number {
  return (fees / tvl) * 100 * 365;
}

export const average = (arr: number[]) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b) / arr.length);

export const trimmedAverage = (arr: number[], trimPercent: number) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);

  const trim = Math.floor(arr.length * trimPercent);

  const trimmed = sorted.slice(trim, arr.length - trim);
  return average(trimmed);
};
