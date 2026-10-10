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
                <td colSpan={4}>Example: EPGL, 122.225, 26L</td>
              </tr>
            )}
            {notes.map((note) => (
              <tr key={note.id}>
                <td>
                  <input
                    value={note.icao}
                    placeholder="EPGL"
                    onChange={(e) => update(note.id, { icao: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={note.radio}
                    placeholder="122.225"
                    onChange={(e) => update(note.id, { radio: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={note.runways}
                    placeholder="26L"
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
