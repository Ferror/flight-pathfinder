# Flight Pathfinder — Implementation Plan

A static TypeScript React app that computes magnetic track (KDM), drift angle (KZ), and magnetic heading (KM) for a multi-leg visual/nav route. No backend. Deployed to GitHub Pages.

Priorities: simple scripts, clean UI, formulas that match `algorithm.md` exactly.

---

## 1. Goal

The user builds a route as a list of named points (waypoints or airports) and a geographic course (KG) for each leg.

Flight-wide inputs:

- TAS (kt)
- Wind direction (meteorological: **from** which the wind blows, 0–360)
- Wind speed (kt)
- Magnetic variation DM (degrees) and sense E or W

Per-leg inputs:

- From name (free text, e.g. `CHARLIE`, `EPGL`)
- To name (free text, e.g. `PAPA`, `WHISKEY`)
- KG — true track, 0–360°

Outputs per leg, shown in a printable report:

| Field | Meaning |
|---|---|
| From → To | User labels |
| KG | True track |
| KDM | Magnetic track |
| KZ | Drift angle (signed) |
| KM | Magnetic heading to steer |

Also a small **airports / radios / runways** section (user-entered notes), e.g. `EPGL, 122.225, 26L`.

---

## 2. Non-goals (v1)

- No map, no GPS, no great-circle distance
- No backend, auth, or cloud save
- No GS / ETE / fuel (velocity triangle only: heading vs track)
- No ICAO database — names and radio lines are free text
- Results are a training/planning aid; the UI should show a short disclaimer from `algorithm.md` §5

---

## 3. Stack

| Piece | Choice | Why |
|---|---|---|
| Runtime | Node.js **LTS** (22.x in CI) | Matches “LTS node” |
| UI | **React 19** + TypeScript | SPA, no backend |
| Build | **Vite** | Simple, GitHub Pages friendly |
| Styling | CSS modules or a single `app.css` | Keep it small; no component library unless layout becomes painful |
| Tests | **Vitest** | Unit-test the nav math in isolation |
| Hosting | GitHub Pages from `gh-pages` branch or `actions/deploy-pages` | Static `dist/` |
| CI | GitHub Actions: install → test → build → deploy | One workflow file |

Scripts (package.json):

- `npm run dev` — local Vite
- `npm test` — Vitest
- `npm run build` — production `dist/`
- `npm run preview` — serve `dist/`

TypeScript: `strict: true`. App lives in `src/`. Nav math has **zero** React imports so it stays easy to test.

---

## 4. Domain model

```ts
type VariationSense = "E" | "W";

type FlightInputs = {
  tasKt: number;
  windDirDeg: number;   // from which the wind blows
  windSpeedKt: number;
  dmDeg: number;        // unsigned magnitude, e.g. 5
  dmSense: VariationSense;
};

type LegInput = {
  id: string;
  from: string;
  to: string;
  kgDeg: number;
};

type AirportNote = {
  id: string;
  icao: string;      // e.g. EPGL
  radio: string;     // e.g. 122.225
  runways: string;   // e.g. 26L
};

type LegResult = {
  kdmDeg: number;
  kwDeg: number;
  kzDeg: number;
  kzMaxDeg: number;
  kmDeg: number;
};

type CalcError = "invalid_speed" | "wind_gte_tas";
```

**Scope of wind / TAS / DM:** one set for the whole flight (as in `algorithm.md`). Changing them recalculates every leg.

**Rounding:** compute in floating point; round only for display (nearest whole degree, matching the EPGL→PAPA example: KZ +14°, KM 331°). Store/print both if useful: display integers, keep exact values for checks.

---

## 5. Algorithm (implementation contract)

Source of truth: `algorithm.md`. Do not “simplify” signs.

1. **KDM**
   - E: `KDM = norm360(KG − DM)`
   - W: `KDM = norm360(KG + DM)`
2. **KW** = `norm±180(KDM − WIND_DIR)`
3. If `TAS ≤ 0` or `wind < 0` → invalid
4. If `wind ≥ TAS` → no real heading; show error, do not invent KM
5. **KZ_max** = `asin(wind / TAS)` in degrees
6. **KZ** = `asin((wind / TAS) * sin(KW))` in degrees  
   Positive KZ → correct KM **left** of KDM; negative → **right**.
7. **KM** = `norm360(KDM − KZ)`

Helpers: `normalize360`, `normalizeSigned` as in the spec (modulo, not a pile of ifs).

Trig: degrees in / degrees out; convert to radians only at `Math.sin` / `Math.asin`.

**Golden test** (`algorithm.md` §4):

| Input | Expected (rounded) |
|---|---|
| KG 350, DM 5°E, wind 270/20, TAS 80 | KDM 345°, KW +75°, KZ +14°, KZ_max 14.5°, KM 331° |

Add a few extra cases: tailwind (KZ ≈ 0), perpendicular wind (|KZ| ≈ KZ_max), westerly variation, wrap around 0°/360°.

---

## 6. UI (one page, three blocks)

Clean, dense, print-friendly. Light background, one typeface, no dashboard chrome.

### 6.1 Flight conditions (top)

Single row / compact form:

- TAS (kt)
- Wind dir (°) + wind speed (kt)
- DM (°) + E/W toggle

Inline validation: TAS > 0, wind ≥ 0, wind < TAS, angles 0–360.

### 6.2 Route legs

Table the user can edit:

| From | To | KG | KDM | KZ | KM | |
|---|---|---|---|---|---|---|
| CHARLIE | PAPA | 50 | … | … | … | delete |

- Add leg (appends a row)
- Optional: “To” of previous row copied into “From” of the next
- Empty names allowed only until report time (warn, still compute if KG is valid)

### 6.3 Airports / radios / runways

Simple list, not a database:

- ICAO / name
- Radio (free text, e.g. `122.225`)
- Runways (free text, e.g. `26L` or `08/26`)

Placeholder copy in empty state: `EPGL, 122.225, 26L`.

### 6.4 Report

Same page, below the editors (or a “Report” view toggled for print):

- Flight conditions summary (TAS, wind, DM)
- Legs table: From, To, KG, KDM, KZ (with sign), KM
- Airport notes
- Disclaimer
- **Print** via `window.print()` + `@media print` (hide editors, keep report)

Optional later: export CSV. Not required for v1.

---

## 7. Persistence

No backend. Save to `localStorage` (flight inputs, legs, airport notes) so a refresh does not wipe the route.

No accounts. Optional “Reset example route” that loads the 11-leg sample from `algorithm.md` (EPGL → PAPA → … → EPGL) for manual checking.

---

## 8. Project layout

```
flight-pathfinder/
  algorithm.md
  plan.md
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  src/
    main.tsx
    App.tsx
    styles.css
    nav/
      angles.ts          # normalize360, normalizeSigned
      calculateCourse.ts # core formula
      calculateCourse.test.ts
    model/
      types.ts
    storage/
      local.ts
    components/
      FlightConditions.tsx
      LegsTable.tsx
      AirportNotes.tsx
      Report.tsx
  .github/
    workflows/
      deploy.yml
```

Vite `base` must match the GitHub Pages path (`/<repo>/` for project pages).

---

## 9. GitHub Pages via Actions

Workflow on `push` to `main`:

1. Checkout
2. Setup Node LTS (22)
3. `npm ci`
4. `npm test`
5. `npm run build`
6. Upload `dist/` and deploy with `actions/deploy-pages` (GitHub-hosted Pages)

Repo settings: Pages source = GitHub Actions.

SPA note: this app is a single `index.html`; no client router needed in v1. If a router is added later, use HashRouter or a 404.html copy of index.

---

## 10. Implementation order

1. **Scaffold** Vite + React + TS, Node LTS engines field, empty UI shell
2. **Nav module** + Vitest golden case and edge cases
3. **State** in `App` (or one hook): conditions, legs, notes; wire calculator
4. **UI** conditions + legs table with live results
5. **Airport notes** + report + print CSS
6. **localStorage** + example-route button
7. **GitHub Action** deploy; confirm `base` URL
8. **Polish**: validation messages, keyboard-friendly table, print layout

Do not start UI before the math tests pass.

---

## 11. Decisions already taken

- Static SPA, React + TypeScript, Vite, Node LTS
- Wind/TAS/DM are **flight-wide**, not per leg
- Point names are free text (points or airports)
- Sign convention: `KM = KDM − KZ` (positive KZ = left correction)
- Round for display only, after the full formula
- GitHub Actions → GitHub Pages

---

## 12. Open points (defaults if unspecified)

| Topic | Default for v1 |
|---|---|
| DM if user omits it | Require it; default example `5 E` |
| KG display | 0–360, one field per leg |
| KZ display | Signed integer degrees (`+14` / `−7`) |
| Distances / times | Out of scope |
| Per-leg wind | Out of scope |
| i18n | English + Polish abbreviations already in the UI (KG, KDM, KZ, KM) |

---

## 13. Success criteria

- Golden example matches `algorithm.md` (KDM 345, KZ +14, KM 331)
- User can enter an arbitrary chain of named legs and see a full report
- Wind ≥ TAS shows a clear error, not a NaN heading
- `npm test` and `npm run build` succeed in CI
- Visiting the GitHub Pages URL loads the app with no server
