import { chainLegs } from "../model/route";
import type { CourseResult, FlightInputs, LegInput } from "../model/types";
import { calculateCourse, formatSignedDeg, roundDeg } from "../nav/calculateCourse";

type Props = {
  legs: LegInput[];
  flight: FlightInputs;
  onChange: (legs: LegInput[]) => void;
};

export function LegsTable({ legs, flight, onChange }: Props) {
  function update(id: string, patch: Partial<LegInput>) {
    onChange(
      chainLegs(legs.map((leg) => (leg.id === id ? { ...leg, ...patch } : leg))),
    );
  }

  function remove(id: string) {
    onChange(chainLegs(legs.filter((leg) => leg.id !== id)));
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Route</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>KG</th>
              <th>KDM</th>
              <th>KZ</th>
              <th>KM</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {legs.map((leg, index) => {
              const result = calculateCourse(leg.kgDeg, flight);
              const fromLocked = index > 0;
              return (
                <tr key={leg.id}>
                  <td>
                    <input
                      value={leg.from}
                      placeholder="CHARLIE"
                      readOnly={fromLocked}
                      title={fromLocked ? "Copied from previous To" : undefined}
                      onChange={(e) => update(leg.id, { from: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={leg.to}
                      placeholder="PAPA"
                      onChange={(e) => update(leg.id, { to: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={360}
                      step={1}
                      value={leg.kgDeg}
                      onChange={(e) =>
                        update(leg.id, { kgDeg: Number(e.target.value) })
                      }
                    />
                  </td>
                  <ResultCells result={result} />
                  <td>
                    <button
                      type="button"
                      className="link danger"
                      onClick={() => remove(leg.id)}
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

function ResultCells({ result }: { result: CourseResult }) {
  if (!result.ok) {
    const message =
      result.error === "wind_gte_tas"
        ? "Wind ≥ TAS"
        : "Invalid speed";
    return (
      <>
        <td colSpan={3} className="error">
          {message}
        </td>
      </>
    );
  }

  const { kdmDeg, kzDeg, kmDeg } = result.value;
  return (
    <>
      <td className="num">{roundDeg(kdmDeg)}°</td>
      <td className="num">{formatSignedDeg(kzDeg)}°</td>
      <td className="num">{roundDeg(kmDeg)}°</td>
    </>
  );
}
