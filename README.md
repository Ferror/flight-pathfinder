# Flight Pathfinder

A small, open planning aid for visual and nav-training flights. You describe a route in the language you already use on a kneeboard — named points, geographic course, wind, TAS — and the app fills in heading, drift, distance, and time.

It runs entirely in the browser. Nothing is uploaded. Your last route stays on your machine.

---

## Why it exists

During flight planning you often know:

- where you are going (`CHARLIE` → `PAPA`, or `EPGL` → a reporting point)
- the **geographic course** (KG)
- the **wind**, **TAS**, and **magnetic variation**

What you still need, for each leg and for the whole trip, is:

- magnetic track (**KDM**)
- drift angle (**KZ**)
- magnetic heading to steer (**KM**)
- time from distance in nautical miles

Flight Pathfinder does that in one screen, then gives you a printable report and a simple sketch of the track.

It is a **training and briefing helper**, not a certified navigation system. Always check the numbers against your syllabus, charts, and aircraft.

---

## What you can do

### Set the day’s conditions

Enter once for the whole flight:

- True airspeed (TAS)
- Wind from-direction and speed
- Magnetic variation (east or west)

Every leg updates when these change. If the wind is as strong as TAS (or stronger), the app tells you a heading cannot be computed instead of inventing one.

### Build a route

Add as many legs as you need. Each row is a named point — a VFR waypoint, an airport, or whatever label you use:

> CHARLIE → PAPA · KG 50° · 20 NM  
> PAPA → WHISKEY · KG 100° · 25 NM  
> WHISKEY → INDIA · …

The next **From** is always the previous **To**, so the chain stays a real path. You type the destination; the following departure fills itself.

For every leg you see:

| You enter | The app calculates |
|---|---|
| From / To | — |
| KG (true track) | KDM, KZ, KM |
| Distance (NM) | Time (distance ÷ TAS) |

A total row sums **nautical miles** and **time** for the whole route.

### Keep airfield notes

A separate table for airports, radios, and runways, for example:

> EPGL · 122.225 · 26L

Free text — no database, no ICAO lookup. Write what you need for the briefing.

### Print a report

The report is meant to leave the computer:

- Conditions (TAS, wind, variation)
- Legs: From, To, KG, KM, NM, time — plus totals  
  (KDM and KZ stay in the working table; they are omitted from the printout)
- Airports as a proper table

### Sketch the track

Below the report is a **schematic map** (not a geographic chart):

- North up
- Ground track from KG and distance
- Heading (KM) as a dashed tick
- Wind, scale bar, and compass
- Leg labels with KG, KM, NM, and time

Print puts the map on its **own page**, so you can take the table, the sketch, or both.

### Comfort

- Light and dark appearance
- Route saved locally so a refresh does not wipe the plan
- An example route you can load to see a complete briefing

---

## How the numbers are meant to be read

The heading model is the familiar velocity triangle:

- **KDM** — magnetic track from KG and variation
- **KZ** — drift (positive means correct heading to the left of track)
- **KM** — heading to steer so the aircraft stays on that track  
  `KM = KDM − KZ`
- **Time** — distance in NM divided by TAS

Wind is meteorological: the direction **from which** it blows.

Roundings are for display. The working values are computed first, then shown as whole degrees and `h:mm`.

---

## Who it is for

Student pilots and instructors who already think in KG / KDM / KZ / KM and want a clean place to try a route, check drift against wind, and print a one-page brief.

It is deliberately small: no map tiles, no fuel, no flight plan filing. Just the path, the wind, and the times.

---

## License

Open source. Use it, copy it, and improve it. Please keep the reminder that results must be checked against official training material before they go in the cockpit.
