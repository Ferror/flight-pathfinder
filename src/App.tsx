import { useEffect, useMemo, useState } from "react";
import { AircraftDetails } from "./components/AircraftDetails";
import { AirportNotes } from "./components/AirportNotes";
import { FlightConditions } from "./components/FlightConditions";
import { LegsTable } from "./components/LegsTable";
import { Report } from "./components/Report";
import { RouteMap } from "./components/RouteMap";
import { Weather } from "./components/Weather";
import {
  defaultAircraft,
  defaultFlight,
  exampleAirports,
  exampleCom,
  exampleLegs,
  newAirport,
  newCom,
  newLeg,
} from "./model/defaults";
import { syncAirportsFromLegs } from "./airports/catalog";
import { ComNotes } from "./components/ComNotes";
import type {
  Aircraft,
  AirportNote,
  ComNote,
  FlightInputs,
  LegInput,
} from "./model/types";
import { chainLegs, normalizeLeg } from "./model/route";
import { calculateCourse } from "./nav/calculateCourse";
import { applyTheme, loadState, saveState, type Theme } from "./storage/local";

function initialState() {
  const stored = loadState();
  const legs = chainLegs((stored?.legs ?? exampleLegs()).map(normalizeLeg));
  return {
    flight: stored?.flight ?? defaultFlight,
    legs,
    airports: syncAirportsFromLegs(legs, stored?.airports ?? exampleAirports()),
    com: stored?.com ?? exampleCom(),
    aircraft: stored?.aircraft ?? defaultAircraft,
    theme: (stored?.theme ?? "light") as Theme,
  };
}

export function App() {
  const [flight, setFlight] = useState<FlightInputs>(() => initialState().flight);
  const [legs, setLegs] = useState<LegInput[]>(() => initialState().legs);
  const [airports, setAirports] = useState<AirportNote[]>(
    () => initialState().airports,
  );
  const [com, setCom] = useState<ComNote[]>(() => initialState().com);
  const [aircraft, setAircraft] = useState<Aircraft>(
    () => initialState().aircraft ?? defaultAircraft,
  );
  const [theme, setTheme] = useState<Theme>(
    () => {
      const next = initialState().theme ?? "light";
      applyTheme(next);
      return next;
    },
  );

  useEffect(() => {
    saveState({ flight, legs, airports, com, aircraft, theme });
  }, [flight, legs, airports, com, aircraft, theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const rows = useMemo(
    () => legs.map((leg) => ({ leg, result: calculateCourse(leg.kgDeg, flight) })),
    [legs, flight],
  );

  function updateLegs(next: LegInput[]) {
    const chained = chainLegs(next);
    setLegs(chained);
    setAirports((current) => syncAirportsFromLegs(chained, current));
  }

  function addLeg() {
    const last = legs[legs.length - 1];
    updateLegs([...legs, newLeg(last?.to ?? "", "", last?.kgDeg ?? 0)]);
  }

  function loadExample() {
    const nextLegs = chainLegs(exampleLegs());
    setFlight(defaultFlight);
    setLegs(nextLegs);
    setAirports(syncAirportsFromLegs(nextLegs, []));
    setCom(exampleCom());
    setAircraft(defaultAircraft);
  }

  return (
    <div className="page">
      <header className="hero no-print">
        <div>
          <p className="eyebrow">Navigation</p>
          <h1>Flight Pathfinder</h1>
          <p className="lede">
            KG, KM, and time from TAS, wind, variation, and distance.
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
          <button
            type="button"
            className="secondary"
            onClick={() => setCom([...com, newCom()])}
          >
            Add FIS
          </button>
        </div>
      </header>

      <FlightConditions value={flight} onChange={setFlight} />
      <Weather
        onApplyWind={(wind) =>
          setFlight({
            ...flight,
            windDirDeg: wind.dirDeg,
            windSpeedKt: wind.speedKt,
          })
        }
      />
      <AircraftDetails value={aircraft} onChange={setAircraft} />
      <LegsTable
        legs={legs}
        flight={flight}
        onChange={updateLegs}
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
      <ComNotes notes={com} onChange={setCom} />
      <div className="no-print add-row">
        <button
          type="button"
          className="secondary"
          onClick={() => setCom([...com, newCom()])}
        >
          Add FIS
        </button>
      </div>
      <div className="print-sheet">
        <Report
          flight={flight}
          aircraft={aircraft}
          rows={rows}
          airports={airports}
          com={com}
        />
        <RouteMap flight={flight} rows={rows} />
      </div>
    </div>
  );
}
