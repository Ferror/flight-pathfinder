import type { AirportNote, CourseResult, FlightInputs, LegInput } from "../model/types";
import { roundDeg } from "../nav/calculateCourse";
import { formatHours, legTimeHours } from "../nav/time";

type Row = {
  leg: LegInput;
  result: CourseResult;
};

type Props = {
  flight: FlightInputs;
  rows: Row[];
  airports: AirportNote[];
};

export function Report({ flight, rows, airports }: Props) {
  const totalNm = rows.reduce((sum, { leg }) => sum + (leg.distanceNm || 0), 0);
  const totalHours = legTimeHours(totalNm, flight.tasKt);
  const shownAirports = airports.filter((a) => a.icao || a.radio || a.runways);

  return (
    <section className="card report" id="report">
      <div className="card-head">
        <h2>Report</h2>
        <button type="button" className="secondary no-print" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <p className="summary">
        TAS {flight.tasKt} kt · Wind {roundDeg(flight.windDirDeg)}° / {flight.windSpeedKt} kt ·
        DM {flight.dmDeg}°{flight.dmSense}
      </p>

      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>KG</th>
            <th>KM</th>
            <th>NM</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ leg, result }) => (
            <tr key={leg.id}>
              <td>{leg.from || "—"}</td>
              <td>{leg.to || "—"}</td>
              <td className="num">{roundDeg(leg.kgDeg)}°</td>
              {result.ok ? (
                <td className="num">{roundDeg(result.value.kmDeg)}°</td>
              ) : (
                <td className="error">
                  {result.error === "wind_gte_tas" ? "Wind ≥ TAS" : "Invalid speed"}
                </td>
              )}
              <td className="num">{leg.distanceNm || 0}</td>
              <td className="num">
                {formatHours(legTimeHours(leg.distanceNm, flight.tasKt))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total</td>
            <td className="num">{totalNm} NM</td>
            <td className="num">{formatHours(totalHours)}</td>
          </tr>
        </tfoot>
      </table>

      {shownAirports.length > 0 && (
        <>
          <h3>Airports</h3>
          <table>
            <thead>
              <tr>
                <th>Airport</th>
                <th>Radio</th>
                <th>Runways</th>
              </tr>
            </thead>
            <tbody>
              {shownAirports.map((a) => (
                <tr key={a.id}>
                  <td>{a.icao || "—"}</td>
                  <td>{a.radio || "—"}</td>
                  <td>{a.runways || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className="disclaimer">
        Time is distance ÷ TAS. Heading uses the drift-angle model. Verify results
        against your navigation syllabus.
      </p>
    </section>
  );
}
