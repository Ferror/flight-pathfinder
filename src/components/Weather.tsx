import { useEffect, useState } from "react";
import {
  fetchSelectedSynops,
  type SynopObservation,
  type SynopStation,
} from "../weather/imgw";

type Row = {
  station: SynopStation;
  observation?: SynopObservation;
  error?: string;
};

type Props = {
  onApplyWind: (wind: { dirDeg: number; speedKt: number }) => void;
};

export function Weather({ onApplyWind }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

  async function load() {
    setStatus("loading");
    const next = await fetchSelectedSynops();
    setRows(next);
    setStatus(next.some((row) => row.observation) ? "ok" : "error");
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="card">
      <div className="card-head">
        <h2>Weather</h2>
        <button
          type="button"
          className="secondary"
          onClick={() => void load()}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading…" : "Refresh"}
        </button>
      </div>
      <p className="summary">
        IMGW synoptic observation — not a METAR. Wind speed is published in m/s
        and converted to knots here. Copy into the plan only after you have
        checked it.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Station</th>
              <th>Time</th>
              <th>Wind</th>
              <th>Temp</th>
              <th>QNH</th>
              <th>Rain</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const obs = row.observation;
              if (row.error || !obs) {
                return (
                  <tr key={row.station.id}>
                    <td>{row.station.name}</td>
                    <td colSpan={6} className="error">
                      {row.error || "No data"}
                    </td>
                  </tr>
                );
              }
              const canCopy =
                obs.windDirDeg !== null && obs.windKt !== null;
              return (
                <tr key={row.station.id}>
                  <td>{obs.stationName}</td>
                  <td>
                    {obs.date}
                    {obs.hour ? ` · ${obs.hour}:00` : ""}
                  </td>
                  <td className="num">
                    {obs.windDirDeg !== null ? `${obs.windDirDeg}°` : "—"}
                    {obs.windMs !== null
                      ? ` / ${obs.windMs} m/s`
                      : ""}
                    {obs.windKt !== null ? ` (${obs.windKt} kt)` : ""}
                  </td>
                  <td className="num">
                    {obs.temperatureC !== null ? `${obs.temperatureC} °C` : "—"}
                  </td>
                  <td className="num">
                    {obs.pressureHpa !== null ? `${obs.pressureHpa}` : "—"}
                  </td>
                  <td className="num">
                    {obs.rainMm !== null ? `${obs.rainMm} mm` : "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="link"
                      disabled={!canCopy}
                      onClick={() =>
                        onApplyWind({
                          dirDeg: obs.windDirDeg!,
                          speedKt: obs.windKt!,
                        })
                      }
                    >
                      Copy wind
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="disclaimer">
        Źródłem pochodzenia danych jest Instytut Meteorologii i Gospodarki
        Wodnej – Państwowy Instytut Badawczy. Dane zostały przetworzone (m/s →
        kt). This is not a flight-folder METAR/TAF. Confirm against{" "}
        <a href="https://awiacja.imgw.pl/" target="_blank" rel="noreferrer">
          Awiacja IMGW
        </a>
        .
      </p>
    </section>
  );
}

