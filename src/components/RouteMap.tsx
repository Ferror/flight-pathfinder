import { useMemo } from "react";
import type { CourseResult, FlightInputs, LegInput } from "../model/types";
import { roundDeg } from "../nav/calculateCourse";
import { plotRoute, step, type PlotSegment } from "../nav/plotRoute";

type Row = {
  leg: LegInput;
  result: CourseResult;
};

type Props = {
  flight: FlightInputs;
  rows: Row[];
};

const VB = { w: 720, h: 560, pad: 78 };

export function RouteMap({ flight, rows }: Props) {
  const plot = useMemo(
    () => plotRoute(rows.map((r) => r.leg), rows.map((r) => r.result), flight.tasKt),
    [rows, flight.tasKt],
  );

  if (rows.length === 0) {
    return (
      <section className="card report map" id="map">
        <div className="card-head">
          <h2>Map</h2>
        </div>
        <p className="summary">Add a route leg to sketch the track.</p>
      </section>
    );
  }

  const { bounds, points, segments } = plot;
  const spanX = Math.max(bounds.maxX - bounds.minX, 8);
  const spanY = Math.max(bounds.maxY - bounds.minY, 8);
  const innerW = VB.w - VB.pad * 2;
  const innerH = VB.h - VB.pad * 2;
  const scale = Math.min(innerW / spanX, innerH / spanY);

  function px(x: number, y: number) {
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    return {
      x: VB.w / 2 + (x - cx) * scale,
      y: VB.h / 2 + (y - cy) * scale,
    };
  }

  const nmPerTick = niceStep(Math.max(spanX, spanY) / 6);
  const scaleBarNm = nmPerTick;
  const scaleBarPx = scaleBarNm * scale;
  const windLen = Math.max(spanX, spanY) * 0.08;
  const windTip = step(0, 0, (flight.windDirDeg + 180) % 360, windLen);
  const windFrom = px(0, 0);
  const windTo = px(windTip.x, windTip.y);
  const windOrigin = { x: 88, y: VB.h - 78 };
  const windDx = windTo.x - windFrom.x;
  const windDy = windTo.y - windFrom.y;

  return (
    <section className="card report map" id="map">
      <div className="card-head">
        <h2>Map</h2>
        <button
          type="button"
          className="secondary no-print"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
      <p className="summary">
        Schematic track from KG and NM. North up. Not a geographic chart.
      </p>
      <div className="map-frame">
        <svg
          className="map-svg"
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          role="img"
          aria-label="Schematic route map"
        >
          <defs>
            <marker
              id="track-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" className="map-track-fill" />
            </marker>
            <marker
              id="head-arrow"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L5,3 L0,6 Z" className="map-heading-fill" />
            </marker>
            <marker
              id="wind-arrow"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L5,3 L0,6 Z" className="map-wind-fill" />
            </marker>
          </defs>

          <rect x="0" y="0" width={VB.w} height={VB.h} className="map-bg" rx="10" />

          <Compass x={VB.w - 52} y={52} />

          {segments.map((seg) => (
            <Segment key={seg.id} seg={seg} px={px} scale={scale} />
          ))}

          {points.map((p, i) => {
            const c = px(p.x, p.y);
            const right = c.x > VB.w - 100;
            const top = c.y < 70;
            return (
              <g key={`${p.name}-${i}`}>
                <circle cx={c.x} cy={c.y} r={i === 0 ? 6 : 4.5} className="map-fix" />
                <text
                  x={c.x + (right ? -10 : 10)}
                  y={c.y + (top ? 18 : -10)}
                  textAnchor={right ? "end" : "start"}
                  className="map-label"
                >
                  {p.name}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${windOrigin.x} ${windOrigin.y})`}>
            <line
              x1={0}
              y1={0}
              x2={windDx}
              y2={windDy}
              className="map-wind"
              markerEnd="url(#wind-arrow)"
            />
            <text x={0} y={22} className="map-meta">
              Wind {roundDeg(flight.windDirDeg)}°/{flight.windSpeedKt} kt
            </text>
          </g>

          <g transform={`translate(${VB.w - 36 - scaleBarPx} ${VB.h - 36})`}>
            <line x1={0} y1={0} x2={scaleBarPx} y2={0} className="map-scale" />
            <line x1={0} y1={-4} x2={0} y2={4} className="map-scale" />
            <line
              x1={scaleBarPx}
              y1={-4}
              x2={scaleBarPx}
              y2={4}
              className="map-scale"
            />
            <text x={scaleBarPx / 2} y={16} textAnchor="middle" className="map-meta">
              {scaleBarNm} NM
            </text>
          </g>
        </svg>
      </div>
      <p className="map-legend">
        <span className="swatch track" /> Track KG
        <span className="swatch heading" /> Heading KM
        <span className="swatch wind" /> Wind (to)
      </p>
    </section>
  );
}

function Segment({
  seg,
  px,
  scale,
}: {
  seg: PlotSegment;
  px: (x: number, y: number) => { x: number; y: number };
  scale: number;
}) {
  const a = px(seg.from.x, seg.from.y);
  const b = px(seg.to.x, seg.to.y);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  const flip = angle > 90 || angle < -90;
  const headingLen = Math.max(18, Math.min(seg.distanceNm * scale * 0.45, 48));
  const headingNm = headingLen / Math.max(scale, 1e-6);
  const headingEnd =
    seg.headingTrueDeg === null
      ? null
      : step(seg.from.x, seg.from.y, seg.headingTrueDeg, headingNm);
  const headingTip = headingEnd ? px(headingEnd.x, headingEnd.y) : null;

  const km =
    seg.kmDeg === null ? "—" : `${roundDeg(seg.kmDeg)}°`;

  return (
    <g>
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        className="map-track"
        markerEnd="url(#track-arrow)"
      />
      {headingTip && (
        <line
          x1={a.x}
          y1={a.y}
          x2={headingTip.x}
          y2={headingTip.y}
          className="map-heading"
          markerEnd="url(#head-arrow)"
        />
      )}
      <text
        x={mx}
        y={my}
        className="map-leg-text"
        transform={`rotate(${flip ? angle + 180 : angle} ${mx} ${my})`}
        dy={flip ? 14 : -8}
        textAnchor="middle"
      >
        KG {roundDeg(seg.kgDeg)}° · KM {km} · {seg.distanceNm} NM · {seg.timeLabel}
      </text>
    </g>
  );
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="map-compass">
      <circle r="22" />
      <polygon points="0,-16 4,-2 0,-5 -4,-2" />
      <text y="-28" textAnchor="middle">
        N
      </text>
    </g>
  );
}

function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 10;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  if (norm < 1.5) return mag;
  if (norm < 3.5) return 2 * mag;
  if (norm < 7.5) return 5 * mag;
  return 10 * mag;
}
