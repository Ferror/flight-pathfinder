import type {
  Aircraft,
  AirportNote,
  CourseResult,
  FlightInputs,
  LegInput,
} from "../model/types";
import type { SynopObservation } from "../weather/imgw";
import { roundDeg } from "../nav/calculateCourse";
import {
  estimatedFuelL,
  formatHours,
  formatLiters,
  legTimeHours,
} from "../nav/time";

type Row = {
  leg: LegInput;
  result: CourseResult;
};

type Props = {
  flight: FlightInputs;
  aircraft: Aircraft;
  rows: Row[];
  airports: AirportNote[];
  weather: SynopObservation[];
};

export function Report({ flight, aircraft, rows, airports, weather }: Props) {
  const totalNm = rows.reduce((sum, { leg }) => sum + (leg.distanceNm || 0), 0);
  const totalHours = legTimeHours(totalNm, flight.tasKt);
  const totalFuel = estimatedFuelL(totalHours, aircraft.fuelLph);
  const shownAirports = airports.filter((a) => a.icao || a.radio || a.runways);
  const plane = [aircraft.typeName, aircraft.registration]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="card report" id="report">
      <div className="card-head">
        <h2>Report</h2>
        <button type="button" className="secondary no-print" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <p className="summary">
        {plane ? `${plane} · ` : ""}
        {aircraft.fuelLph > 0 ? `${aircraft.fuelLph} L/h · ` : ""}
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
            <th>Fuel</th>
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
              <td className="num">
                {formatLiters(
                  estimatedFuelL(
                    legTimeHours(leg.distanceNm, flight.tasKt),
                    aircraft.fuelLph,
                  ),
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total</td>
            <td className="num">{totalNm} NM</td>
            <td className="num">{formatHours(totalHours)}</td>
            <td className="num">{formatLiters(totalFuel)}</td>
          </tr>
        </tfoot>
      </table>

      {weather.length > 0 && (
        <>
          <h3>IMGW synop</h3>
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Time</th>
                <th>Wind</th>
                <th>Temp</th>
                <th>QNH</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((obs) => (
                <tr key={obs.stationId}>
                  <td>{obs.stationName}</td>
                  <td>
                    {obs.date}
                    {obs.hour ? ` · ${obs.hour}:00` : ""}
                  </td>
                  <td className="num">
                    {obs.windDirDeg !== null ? `${obs.windDirDeg}°` : "—"}
                    {obs.windKt !== null ? ` / ${obs.windKt} kt` : ""}
                  </td>
                  <td className="num">
                    {obs.temperatureC !== null ? `${obs.temperatureC} °C` : "—"}
                  </td>
                  <td className="num">
                    {obs.pressureHpa !== null ? `${obs.pressureHpa}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

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
        Fuel is planned time × the L/h you entered. It is cruise only: no taxi,
        climb, contingency, or reserve. Check usable fuel and minima yourself.
        Time is distance ÷ TAS. Heading uses the drift-angle model.
      </p>
    </section>
  );
}
