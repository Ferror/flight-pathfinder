import type { AirportNote, CourseResult, FlightInputs, LegInput } from "../model/types";
import { formatSignedDeg, roundDeg } from "../nav/calculateCourse";

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
            <th>KDM</th>
            <th>KZ</th>
            <th>KM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ leg, result }) => (
            <tr key={leg.id}>
              <td>{leg.from || "—"}</td>
              <td>{leg.to || "—"}</td>
              <td className="num">{roundDeg(leg.kgDeg)}°</td>
              {result.ok ? (
                <>
                  <td className="num">{roundDeg(result.value.kdmDeg)}°</td>
                  <td className="num">{formatSignedDeg(result.value.kzDeg)}°</td>
                  <td className="num">{roundDeg(result.value.kmDeg)}°</td>
                </>
              ) : (
                <td colSpan={3} className="error">
                  {result.error === "wind_gte_tas" ? "Wind ≥ TAS" : "Invalid speed"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {airports.some((a) => a.icao || a.radio || a.runways) && (
        <>
          <h3>Airports</h3>
          <ul className="airport-list">
            {airports.map((a) => (
              <li key={a.id}>
                {[a.icao, a.radio, a.runways].filter(Boolean).join(", ")}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="disclaimer">
        Drift-angle model from the velocity triangle. Verify results against your
        navigation syllabus. Round only for display.
      </p>
    </section>
  );
}
