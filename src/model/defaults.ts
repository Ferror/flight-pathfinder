import type { AirportNote, FlightInputs, LegInput } from "./types";

export const defaultFlight: FlightInputs = {
  tasKt: 80,
  windDirDeg: 270,
  windSpeedKt: 20,
  dmDeg: 5,
  dmSense: "E",
};

export function newId(): string {
  return crypto.randomUUID();
}

export function newLeg(from = "", to = "", kgDeg = 0): LegInput {
  return { id: newId(), from, to, kgDeg };
}

export function newAirport(
  icao = "",
  radio = "",
  runways = "",
): AirportNote {
  return { id: newId(), icao, radio, runways };
}

export function exampleLegs(): LegInput[] {
  return [
    newLeg("EPGL", "PAPA", 350),
    newLeg("PAPA", "WHISKEY", 100),
    newLeg("WHISKEY", "INDIA", 50),
  ];
}

export function exampleAirports(): AirportNote[] {
  return [newAirport("EPGL", "122.225", "26L")];
}
