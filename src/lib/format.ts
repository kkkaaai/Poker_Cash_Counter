export function formatNet(net: number): string {
  if (net >= 0) return `+\u00a3${net}`;
  return `-\u00a3${Math.abs(net)}`;
}
