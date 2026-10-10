export function normalize360(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function normalizeSigned(angle: number): number {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}
