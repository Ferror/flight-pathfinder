import type { Aircraft, AirportNote, FlightInputs, LegInput } from "../model/types";

const KEY = "flight-pathfinder:v1";

export type Theme = "light" | "dark";

export type StoredState = {
  flight: FlightInputs;
  legs: LegInput[];
  airports: AirportNote[];
  aircraft?: Aircraft;
  theme?: Theme;
};

export function loadState(): StoredState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed.flight || !Array.isArray(parsed.legs) || !Array.isArray(parsed.airports)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: StoredState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
