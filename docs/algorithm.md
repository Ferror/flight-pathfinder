# Summary and Algorithm Specification for KDM, KZ, and KM

During our conversation, we calculated navigation parameters for several flight routes using the true track angle (KG), magnetic variation (DM), true airspeed (TAS), and wind.

The main lesson from the calculations is that **the algorithm must explicitly define its sign convention, correctly account for wind direction, and validate results mathematically**. Earlier calculations contained errors in KZ and inconsistencies between the sign of KZ and the formula used for KM. This specification defines a consistent approach from first principles.

## 1. Inputs

For each route leg:

- `KG` — true track angle, in degrees.
- `DM` — magnetic variation; in our examples, `5°E`.
- `WIND_DIR` — the direction **from which** the wind is blowing, e.g. `270°`.
- `WIND_SPEED` — wind speed, e.g. `20 kt`.
- `TAS` — aircraft true airspeed, e.g. `80 kt`.

Example data from the most recent route:

- Wind: `270°/20 kt`
- TAS: `80 kt`
- Magnetic variation: `5°E`
- Route: 11 legs, from EPGL via PAPA, CHARLIE, WHISKEY, EPRU, SIERRA, JULIET, WHISKEY, EPKT, GOLF, and TANGO, returning to EPGL.

## 2. Definitions and formulas

This specification uses one consistent convention:

- A **positive KZ** means the magnetic heading (KM) is corrected to the left of KDM.
- A **negative KZ** means the magnetic heading is corrected to the right.
- Magnetic heading is calculated as `KM = KDM − KZ`.

### Step 1 — KDM

The magnetic track angle is calculated by applying magnetic variation.

\[
\boxed{KDM = KG-DM}
\]

For easterly variation (`E`), subtract its value. For westerly variation (`W`), add its value.

Normalize the result to the range \(0^\circ\)–\(359.999\ldots^\circ\).

### Step 2 — Track angle relative to the wind

The meteorological wind direction indicates the direction **from which** the wind is blowing.

Define the helper angle:

\[
\boxed{KW=\operatorname{norm}_{\pm180}(KDM-WIND\_DIR)}
\]

The `norm±180` function normalizes an angle to the range −180° to +180°.

### Step 3 — KZ

Calculate the drift angle using the crosswind component:

\[
\boxed{KZ=\arcsin\left(\frac{WIND\_SPEED}{TAS}\sin KW\right)}
\]

In an implementation, trigonometric functions may require converting degrees to radians. Convert the result of `arcsin` back to degrees.

### Step 4 — KM

\[
\boxed{KM=\operatorname{norm}_{360}(KDM-KZ)}
\]

This is the magnetic heading to steer, accounting for the wind, in order to maintain the desired magnetic track.

### Step 5 — Maximum drift angle

Assuming wind speed is lower than TAS:

\[
\boxed{KZ_{\max}=\arcsin\left(\frac{WIND\_SPEED}{TAS}\right)}
\]

For our example:

\[
KZ_{\max}=\arcsin(20/80)\approx14.48^\circ
\]

This is the maximum absolute value of KZ, reached when the wind is perpendicular to the desired track. If the wind is exactly a headwind or tailwind, KZ is zero.

If `WIND_SPEED > TAS`, the formula above for maximum KZ has no real solution. The algorithm should report this case rather than return a seemingly valid heading.

## 3. Algorithm

The following pseudocode can be adapted directly to JavaScript, Python, or a spreadsheet.

```python
def normalize_360(angle):
    return angle % 360

def normalize_signed(angle):
    return (angle + 180) % 360 - 180

def calculate_course(KG, DM, variation, wind_dir, wind_speed, TAS):
    # variation: "E" or "W"
    # Wind direction is the direction FROM which the wind blows

    if TAS <= 0 or wind_speed < 0:
        raise ValueError("Invalid speed")

    if wind_speed >= TAS:
        raise ValueError("Wind speed must be lower than TAS")

    # 1. Magnetic track angle
    if variation == "E":
        KDM = normalize_360(KG - DM)
    elif variation == "W":
        KDM = normalize_360(KG + DM)
    else:
        raise ValueError("Variation must be E or W")

    # 2. Angle relative to the wind direction
    KW = normalize_signed(KDM - wind_dir)

    # 3. Maximum drift angle
    import math
    ratio = wind_speed / TAS
    KZ_max = math.degrees(math.asin(ratio))

    # 4. Drift angle
    crosswind_ratio = ratio * math.sin(math.radians(KW))
    KZ = math.degrees(math.asin(crosswind_ratio))

    # 5. Magnetic heading
    KM = normalize_360(KDM - KZ)

    # Validation
    assert abs(KZ) <= KZ_max + 1e-9

    return {
        "KDM": KDM,
        "KW": KW,
        "KZ": KZ,
        "KZ_max": KZ_max,
        "KM": KM,
    }
```

## 4. Validation example using our route data

For the leg EPGL → PAPA:

| Parameter | Result |
|---|---:|
| KG | 350° |
| DM | 5°E |
| KDM | 345° |
| Wind | 270°/20 kt |
| TAS | 80 kt |
| KW = KDM − wind direction | +75° |
| KZ | +14.0° |
| KZ max | 14.5° |
| KM = KDM − KZ | 331° |

Rounded to whole degrees: **KDM 345°, KZ +14°, KM 331°**.

## 5. Result validation

Each route leg should pass these checks:

1. KDM is in the range 0°–360°.
2. The absolute value of KZ does not exceed KZ max.
3. KM is in the range 0°–360°.
4. After accounting for wind, the resulting flight direction matches the desired KDM.
5. Round only after all calculations are complete. Do not round KDM or KW before calculating KZ.

**Important limitation:** This is a drift-angle model based on the velocity triangle. It assumes the aircraft can maintain the desired track at a constant TAS in the given wind. For aviation use, verify the results against your training materials and the sign convention used in your navigation syllabus.
