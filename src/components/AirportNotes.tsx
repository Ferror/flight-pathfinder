import { aipAeroUrl } from "../airports/catalog";
import type { AirportNote } from "../model/types";

type Props = {
  notes: AirportNote[];
  onChange: (notes: AirportNote[]) => void;
};

export function AirportNotes({ notes, onChange }: Props) {
  function update(id: string, patch: Partial<AirportNote>) {
    onChange(notes.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function remove(id: string) {
    onChange(notes.filter((n) => n.id !== id));
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Airports, radios, runways</h2>
      </div>
      <p className="summary">
        Four-letter EP codes on the route create a row. Copy radio and runways
        from the AIP yourself — the code links to{" "}
        <a href="https://aip.aero/pl/vfr/?EPGL" target="_blank" rel="noreferrer">
          AIP:Aero
        </a>{" "}
        for a quicker lookup.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Airport</th>
              <th>Radio</th>
              <th>Runways</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 && (
              <tr className="empty">
                <td colSpan={4}>Add EPGL on the route to create a row.</td>
              </tr>
            )}
            {notes.map((note) => {
              const aip = aipAeroUrl(note.icao);
              return (
              <tr key={note.id}>
                <td>
                  <input
                    value={note.icao}
                    placeholder="EPGL"
                    onChange={(e) => update(note.id, { icao: e.target.value })}
                  />
                  {aip && (
                    <a
                      className="aip-link no-print"
                      href={aip}
                      target="_blank"
                      rel="noreferrer"
                    >
                      AIP:Aero
                    </a>
                  )}
                </td>
                <td>
                  <input
                    value={note.radio}
                    placeholder="118.260"
                    onChange={(e) => update(note.id, { radio: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={note.runways}
                    placeholder="08L/26R"
                    onChange={(e) =>
                      update(note.id, { runways: e.target.value })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="link danger"
                    onClick={() => remove(note.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
