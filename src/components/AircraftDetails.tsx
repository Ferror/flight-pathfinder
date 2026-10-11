import type { Aircraft } from "../model/types";

type Props = {
  value: Aircraft;
  onChange: (next: Aircraft) => void;
};

export function AircraftDetails({ value, onChange }: Props) {
  function set<K extends keyof Aircraft>(key: K, v: Aircraft[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Aircraft</h2>
      </div>
      <p className="summary">
        You enter the burn rate from the POH or your own figures. The estimate
        only multiplies that by planned time.
      </p>
      <div className="grid-conditions">
        <label>
          Type
          <input
            type="text"
            value={value.typeName}
            placeholder="Cessna 150"
            onChange={(e) => set("typeName", e.target.value)}
          />
        </label>
        <label>
          Registration
          <input
            type="text"
            value={value.registration}
            placeholder="SP-UTK"
            onChange={(e) => set("registration", e.target.value)}
          />
        </label>
        <label>
          Fuel (L/h)
          <input
            type="number"
            min={0}
            step={0.1}
            value={value.fuelLph}
            onChange={(e) => set("fuelLph", Number(e.target.value))}
          />
        </label>
      </div>
    </section>
  );
}