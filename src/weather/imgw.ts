export type SynopStation = {
  id: string;
  name: string;
};

export const synopStations: SynopStation[] = [
  { id: "12560", name: "Katowice" },
  { id: "12566", name: "Kraków" },
  { id: "12550", name: "Częstochowa" },
];

export type SynopObservation = {
  stationId: string;
  stationName: string;
  date: string;
  hour: string;
  temperatureC: number | null;
  windDirDeg: number | null;
  windMs: number | null;
  windKt: number | null;
  pressureHpa: number | null;
  rainMm: number | null;
};

type SynopJson = {
  id_stacji?: string;
  stacja?: string;
  data_pomiaru?: string;
  godzina_pomiaru?: string;
  temperatura?: string;
  predkosc_wiatru?: string;
  kierunek_wiatru?: string;
  suma_opadu?: string;
  cisnienie?: string;
};

const MS_TO_KT = 1.943844;

export function msToKt(ms: number): number {
  return Math.round(ms * MS_TO_KT);
}

function num(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseSynop(raw: SynopJson, fallback: SynopStation): SynopObservation {
  const windMs = num(raw.predkosc_wiatru);
  return {
    stationId: raw.id_stacji || fallback.id,
    stationName: raw.stacja || fallback.name,
    date: raw.data_pomiaru || "",
    hour: raw.godzina_pomiaru || "",
    temperatureC: num(raw.temperatura),
    windDirDeg: num(raw.kierunek_wiatru),
    windMs,
    windKt: windMs === null ? null : msToKt(windMs),
    pressureHpa: num(raw.cisnienie),
    rainMm: num(raw.suma_opadu),
  };
}

export async function fetchSynop(station: SynopStation): Promise<SynopObservation> {
  const url = `https://danepubliczne.imgw.pl/api/data/synop/id/${station.id}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`IMGW ${station.name}: ${res.status}`);
  }
  const raw = (await res.json()) as SynopJson;
  return parseSynop(raw, station);
}

export async function fetchSelectedSynops(): Promise<
  { station: SynopStation; observation?: SynopObservation; error?: string }[]
> {
  return Promise.all(
    synopStations.map(async (station) => {
      try {
        return { station, observation: await fetchSynop(station) };
      } catch (err) {
        return {
          station,
          error: err instanceof Error ? err.message : "Could not load",
        };
      }
    }),
  );
}
