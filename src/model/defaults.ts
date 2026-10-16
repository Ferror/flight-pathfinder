import type {
  Aircraft,
  AirportNote,
  ComNote,
  FlightInputs,
  LegInput,
} from "./types";

export const defaultFlight: FlightInputs = {
  tasKt: 80,
  windDirDeg: 270,
  windSpeedKt: 20,
  dmDeg: 5,
  dmSense: "E",
};

export const defaultAircraft: Aircraft = {
  typeName: "Cessna 150",
  registration: "SP-UTK",
  fuelLph: 22,
};

export function newId(): string {
  return crypto.randomUUID();
}

export function newLeg(
  from = "",
  to = "",
  kgDeg = 0,
  distanceNm = 20,
): LegInput {
  return { id: newId(), from, to, kgDeg, distanceNm };
}

export function newAirport(
  icao = "",
  radio = "",
  runways = "",
  name = "",
): AirportNote {
  return { id: newId(), icao, name, radio, runways };
}

export function exampleLegs(): LegInput[] {
  return [
    newLeg("EPGL", "PAPA", 350, 20),
    newLeg("PAPA", "WHISKEY", 100, 25),
    newLeg("WHISKEY", "INDIA", 50, 15),
  ];
}

export function exampleAirports(): AirportNote[] {
  return [];
}

export function newCom(
  unit = "",
  radio = "",
  note = "",
): ComNote {
  return { id: newId(), unit, radio, note };
}

export function exampleCom(): ComNote[] {
  return [
    newCom("FIS Kraków", "119.275 MHz", "sektor zachód"),
    newCom("FIS Kraków", "119.950 MHz", "sektor wschód"),
  ];
}
