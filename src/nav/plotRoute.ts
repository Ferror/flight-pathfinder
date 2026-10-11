import type { CourseResult, LegInput } from "../model/types";
import { formatHours, legTimeHours } from "./time";

export type PlotPoint = {
  x: number;
  y: number;
  name: string;
};

export type PlotSegment = {
  id: string;
  from: PlotPoint;
  to: PlotPoint;
  kgDeg: number;
  kmDeg: number | null;
  headingTrueDeg: number | null;
  distanceNm: number;
  timeLabel: string;
};

export type RoutePlot = {
  points: PlotPoint[];
  segments: PlotSegment[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Aviation: 0° = north, clockwise. SVG: +x east, +y south. */
export function step(x: number, y: number, courseDeg: number, nm: number) {
  return {
    x: x + nm * Math.sin(toRad(courseDeg)),
    y: y - nm * Math.cos(toRad(courseDeg)),
  };
}

export function plotRoute(
  legs: LegInput[],
  results: CourseResult[],
  tasKt: number,
): RoutePlot {
  let x = 0;
  let y = 0;
  const points: PlotPoint[] = [
    { x, y, name: legs[0]?.from.trim() || "START" },
  ];
  const segments: PlotSegment[] = [];

  legs.forEach((leg, index) => {
    const nm = Number.isFinite(leg.distanceNm) ? Math.max(leg.distanceNm, 0) : 0;
    const next = step(x, y, leg.kgDeg, nm);
    const result = results[index];
    const kmDeg = result?.ok ? result.value.kmDeg : null;
    const headingTrueDeg =
      result?.ok ? leg.kgDeg - result.value.kzDeg : null;
    const toPoint: PlotPoint = {
      x: next.x,
      y: next.y,
      name: leg.to.trim() || `WP${index + 1}`,
    };
    segments.push({
      id: leg.id,
      from: { x, y, name: points[points.length - 1].name },
      to: toPoint,
      kgDeg: leg.kgDeg,
      kmDeg,
      headingTrueDeg,
      distanceNm: nm,
      timeLabel: formatHours(legTimeHours(nm, tasKt)),
    });
    x = next.x;
    y = next.y;
    points.push(toPoint);
  });

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const pad = 1;
  return {
    points,
    segments,
    bounds: {
      minX: Math.min(...xs, 0) - pad,
      minY: Math.min(...ys, 0) - pad,
      maxX: Math.max(...xs, 0) + pad,
      maxY: Math.max(...ys, 0) + pad,
    },
  };
}

