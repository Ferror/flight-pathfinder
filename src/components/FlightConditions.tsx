import type { FlightInputs, VariationSense } from "../model/types";

type Props = {
  value: FlightInputs;
  onChange: (next: FlightInputs) => void;
};

export function FlightConditions({ value, onChange }: Props) {
  function set<K extends keyof FlightInputs>(key: K, v: FlightInputs[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Flight conditions</h2>
      </div>
      <div className="grid-conditions">
        <label>
          TAS (kt)
          <input
            type="number"
            min={1}
            step={1}
            value={value.tasKt}
            onChange={(e) => set("tasKt", Number(e.target.value))}
          />
        </label>
        <label>
          Wind from (°)
          <input
            type="number"
            min={0}
            max={360}
            step={1}
            value={value.windDirDeg}
            onChange={(e) => set("windDirDeg", Number(e.target.value))}
          />
        </label>
        <label>
          Wind speed (kt)
          <input
            type="number"
            min={0}
            step={1}
            value={value.windSpeedKt}
            onChange={(e) => set("windSpeedKt", Number(e.target.value))}
          />
        </label>
        <label>
          DM (°)
          <input
            type="number"
            min={0}
            step={1}
            value={value.dmDeg}
            onChange={(e) => set("dmDeg", Number(e.target.value))}
          />
        </label>
        <fieldset className="sense">
          <legend>Variation</legend>
          {(["E", "W"] as VariationSense[]).map((sense) => (
            <label key={sense} className="radio">
              <input
                type="radio"
                name="dmSense"
                checked={value.dmSense === sense}
                onChange={() => set("dmSense", sense)}
              />
              {sense}
            </label>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
