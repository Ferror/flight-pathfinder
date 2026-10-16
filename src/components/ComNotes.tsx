import type { ComNote } from "../model/types";

type Props = {
  notes: ComNote[];
  onChange: (notes: ComNote[]) => void;
};

export function ComNotes({ notes, onChange }: Props) {
  function update(id: string, patch: Partial<ComNote>) {
    onChange(notes.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function remove(id: string) {
    onChange(notes.filter((n) => n.id !== id));
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>FIS / INFO</h2>
      </div>
      <p className="summary">
        En-route frequencies for the kneeboard — not an airport. Check the
        current sector against the AIP before you call.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unit</th>
              <th>Radio</th>
              <th>Sector</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 && (
              <tr className="empty">
                <td colSpan={4}>Add FIS Kraków or another unit.</td>
              </tr>
            )}
            {notes.map((note) => (
              <tr key={note.id}>
                <td>
                  <input
                    value={note.unit}
                    placeholder="FIS Kraków"
                    onChange={(e) => update(note.id, { unit: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={note.radio}
                    placeholder="119.275 MHz"
                    onChange={(e) => update(note.id, { radio: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={note.note}
                    placeholder="sektor zachód"
                    onChange={(e) => update(note.id, { note: e.target.value })}
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
