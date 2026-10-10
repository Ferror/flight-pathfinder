import type { CourseResult, FlightInputs } from "../model/types";
import { normalize360, normalizeSigned } from "./angles";

export function calculateCourse(
  kgDeg: number,
  flight: FlightInputs,
): CourseResult {
  const { tasKt, windSpeedKt, windDirDeg, dmDeg, dmSense } = flight;

  if (!(tasKt > 0) || windSpeedKt < 0) {
    return { ok: false, error: "invalid_speed" };
  }

  if (windSpeedKt >= tasKt) {
    return { ok: false, error: "wind_gte_tas" };
  }

  const kdmDeg =
    dmSense === "E"
      ? normalize360(kgDeg - dmDeg)
      : normalize360(kgDeg + dmDeg);

  const kwDeg = normalizeSigned(kdmDeg - windDirDeg);
  const ratio = windSpeedKt / tasKt;
  const kzMaxDeg = radToDeg(Math.asin(ratio));
  const kzDeg = radToDeg(Math.asin(ratio * Math.sin(degToRad(kwDeg))));
  const kmDeg = normalize360(kdmDeg - kzDeg);

  return {
    ok: true,
    value: { kdmDeg, kwDeg, kzDeg, kzMaxDeg, kmDeg },
  };
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function roundDeg(value: number): number {
  return Math.round(value);
}

export function formatSignedDeg(value: number): string {
  const rounded = roundDeg(value);
  if (rounded > 0) return `+${rounded}`;
  return String(rounded);
}
