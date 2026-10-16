import type { AirportNote, LegInput } from "../model/types";
import { newAirport } from "../model/defaults";

const ICAO = /^EP[A-Z0-9]{2}$/;

export function normalizeIcao(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function isAirportCode(value: string): boolean {
  return ICAO.test(normalizeIcao(value));
}

export function aipAeroUrl(value: string): string | undefined {
  const icao = normalizeIcao(value);
  if (!isAirportCode(icao)) return undefined;
  return `https://aip.aero/pl/vfr/?${icao}`;
}

export function airportCodesFromLegs(legs: LegInput[]): string[] {
  const seen = new Set<string>();
  const codes: string[] = [];
  for (const leg of legs) {
    for (const point of [leg.from, leg.to]) {
      const icao = normalizeIcao(point);
      if (!isAirportCode(icao) || seen.has(icao)) continue;
      seen.add(icao);
      codes.push(icao);
    }
  }
  return codes;
}

function noteKey(note: AirportNote): string {
  return normalizeIcao(note.icao);
}

function isPristine(note: AirportNote): boolean {
  return !note.radio.trim() && !note.runways.trim() && !(note.name ?? "").trim();
}

/** Add EP-codes from the route; drop unused empty EP rows. Keep extra/edited rows. */
export function syncAirportsFromLegs(
  legs: LegInput[],
  existing: AirportNote[],
): AirportNote[] {
  const needed = airportCodesFromLegs(legs);
  const neededSet = new Set(needed);
  const byCode = new Map<string, AirportNote>();
  const extras: AirportNote[] = [];

  for (const note of existing) {
    const key = noteKey(note);
    if (isAirportCode(key)) {
      if (!byCode.has(key)) byCode.set(key, note);
    } else {
      extras.push(note);
    }
  }

  const next: AirportNote[] = [];
  for (const icao of needed) {
    next.push(byCode.get(icao) ?? newAirport(icao));
    byCode.delete(icao);
  }

  for (const leftover of byCode.values()) {
    if (!neededSet.has(noteKey(leftover)) && isPristine(leftover)) continue;
    next.push(leftover);
  }

  return [...next, ...extras];
}
