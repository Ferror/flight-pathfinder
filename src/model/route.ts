import type { LegInput } from "./types";

/** Each leg's From is the previous leg's To. The first From stays as entered. */
export function chainLegs(legs: LegInput[]): LegInput[] {
  return legs.map((leg, index) =>
    index === 0 ? leg : { ...leg, from: legs[index - 1].to },
  );
}

export function normalizeLeg(leg: LegInput): LegInput {
  const distanceNm = Number(leg.distanceNm);
  return {
    ...leg,
    distanceNm: Number.isFinite(distanceNm) && distanceNm >= 0 ? distanceNm : 0,
  };
}
