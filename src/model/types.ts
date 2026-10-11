export type VariationSense = "E" | "W";

export type FlightInputs = {
  tasKt: number;
  windDirDeg: number;
  windSpeedKt: number;
  dmDeg: number;
  dmSense: VariationSense;
};

export type Aircraft = {
  typeName: string;
  registration: string;
  fuelLph: number;
};

export type LegInput = {
  id: string;
  from: string;
  to: string;
  kgDeg: number;
  distanceNm: number;
};

export type AirportNote = {
  id: string;
  icao: string;
  radio: string;
  runways: string;
};

export type LegResult = {
  kdmDeg: number;
  kwDeg: number;
  kzDeg: number;
  kzMaxDeg: number;
  kmDeg: number;
};

export type CalcError = "invalid_speed" | "wind_gte_tas";

export type CourseResult =
  | { ok: true; value: LegResult }
  | { ok: false; error: CalcError };
