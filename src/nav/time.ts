/** Leg time in hours from distance (NM) and TAS (kt). */
export function legTimeHours(distanceNm: number, tasKt: number): number | null {
  if (!(tasKt > 0) || !Number.isFinite(distanceNm) || distanceNm < 0) {
    return null;
  }
  return distanceNm / tasKt;
}

export function formatHours(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours) || hours < 0) return "—";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** Cruise fuel from planned time and the burn rate the pilot entered. */
export function estimatedFuelL(
  hours: number | null,
  fuelLph: number,
): number | null {
  if (hours === null || !(fuelLph > 0)) return null;
  return hours * fuelLph;
}

export function formatLiters(liters: number | null): string {
  if (liters === null || !Number.isFinite(liters) || liters < 0) return "—";
  return `${liters.toFixed(1)} L`;
}
