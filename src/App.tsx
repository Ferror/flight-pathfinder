import { useEffect, useMemo, useState } from "react";
import { AirportNotes } from "./components/AirportNotes";
import { FlightConditions } from "./components/FlightConditions";
import { LegsTable } from "./components/LegsTable";
import { Report } from "./components/Report";
import {
  defaultFlight,
  exampleAirports,
  exampleLegs,
  newAirport,
  newLeg,
} from "./model/defaults";
import type { AirportNote, FlightInputs, LegInput } from "./model/types";
import { chainLegs } from "./model/route";
import { calculateCourse } from "./nav/calculateCourse";
import { applyTheme, loadState, saveState, type Theme } from "./storage/local";

function initialState() {
  return (
    loadState() ?? {
      flight: defaultFlight,
      legs: exampleLegs(),
      airports: exampleAirports(),
      theme: "light" as Theme,
    }
  );
}

export function App() {
  const [flight, setFlight] = useState<FlightInputs>(() => initialState().flight);
  const [legs, setLegs] = useState<LegInput[]>(() =>
    chainLegs(initialState().legs),
  );
  const [airports, setAirports] = useState<AirportNote[]>(
    () => initialState().airports,
  );
  const [theme, setTheme] = useState<Theme>(
    () => {
      const next = initialState().theme ?? "light";
      applyTheme(next);
      return next;
    },
  );

  useEffect(() => {
    saveState({ flight, legs, airports, theme });
  }, [flight, legs, airports, theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const rows = useMemo(
    () => legs.map((leg) => ({ leg, result: calculateCourse(leg.kgDeg, flight) })),
    [legs, flight],
  );

  function addLeg() {
    const last = legs[legs.length - 1];
    setLegs(chainLegs([...legs, newLeg(last?.to ?? "", "", last?.kgDeg ?? 0)]));
  }

  function loadExample() {
    setFlight(defaultFlight);
    setLegs(chainLegs(exampleLegs()));
    setAirports(exampleAirports());
  }

  return (
    <div className="page">
      <header className="hero no-print">
        <div>
          <p className="eyebrow">Navigation</p>
          <h1>Flight Pathfinder</h1>
          <p className="lede">
            KG → KDM, KZ, KM from TAS, wind, and magnetic variation.
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button type="button" className="secondary" onClick={loadExample}>
            Load example
          </button>
          <button type="button" onClick={addLeg}>
            Add leg
          </button>
          <button type="button" className="secondary" onClick={() => setAirports([...airports, newAirport()])}>
            Add airport
          </button>
        </div>
      </header>

      <FlightConditions value={flight} onChange={setFlight} />
      <LegsTable
        legs={legs}
        flight={flight}
        onChange={setLegs}
      />
      <div className="no-print add-row">
        <button type="button" className="secondary" onClick={addLeg}>
          Add leg
        </button>
      </div>
      <AirportNotes notes={airports} onChange={setAirports} />
      <div className="no-print add-row">
        <button type="button" className="secondary" onClick={() => setAirports([...airports, newAirport()])}>
          Add airport
        </button>
      </div>
      <Report flight={flight} rows={rows} airports={airports} />
    </div>
  );
}
