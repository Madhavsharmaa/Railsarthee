
"use client";

import {
  Clock3,
  MapPin,
  Milestone,
  Navigation,
  TrainFront,
  TrendingUp,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TrainInput from "../../components/TrainInput";
import {
  timetable,
  TrainSuggestion,
} from "../../lib/api";

interface TimetableStation {
  station: string;
  code: string;
  arrival: string;
  departure: string;
  distance: string;
  halt: string;
  avgDelay: string;
  day: string;
}

interface TimetableResponse {
  success?: boolean;
  train_number?: string;
  train_name?: string;
  train_label?: string;

  data?: unknown;
  stations?: unknown;
  timetable?: unknown;
  route?: unknown;

  total_stations?: number;
  distance?: string;
  duration?: string;

  from_station?: string;
  to_station?: string;

  error?: string;
}

export default function Page() {
  const [train, setTrain] = useState<TrainSuggestion | null>(null);
  const [data, setData] = useState<TimetableResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!train) {
      setError("Select a train from the suggestions.");
      return;
    }

    setError("");
    setData(null);
    setLoading(true);

    try {
      const result = await timetable(train.train_number);
      setData(result as TimetableResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const stations = useMemo(
    () => normalizeStations(data),
    [data]
  );

  useEffect(() => {
    if (data && stations.length > 0) {
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [data, stations.length]);

  const trainNumber =
    data?.train_number ||
    train?.train_number ||
    "";

  const trainName =
    data?.train_name ||
    data?.train_label ||
    getSuggestionName(train) ||
    "Train Timetable";

  const firstStation = stations[0];
  const lastStation =
    stations[stations.length - 1];

  const totalStations = stations.length;

  const distance =
    data?.distance ||
    lastStation?.distance ||
    "";

  const calculatedDuration =
    data?.duration ||
    calculateJourneyDuration(stations);

  return (
    <>
      <Header />

      <main className="tool-page">
        <section className="tool-hero">
          <div className="eyebrow">
            RAILSARTHEE TOOL
          </div>

          <h1>Train Timetable</h1>

          <p>
            View the station-by-station scheduled
            journey of your train.
          </p>
        </section>

        <section className="tool-card">
          <form onSubmit={submit}>
            <TrainInput
              value={train}
              onChange={setTrain}
            />

            <button
              className="primary-btn wide"
              disabled={loading}
            >
              {loading
                ? "LOADING..."
                : "GET TIMETABLE"}
            </button>
          </form>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
        </section>

        {data && stations.length > 0 && (
          <section
            ref={resultsRef}
            className="mx-auto mt-8 mb-16 w-full max-w-[930px] scroll-mt-5"
          >
            {/* =====================================================
                SUMMARY CARD
            ===================================================== */}

            <div className="overflow-hidden rounded-[26px] border border-blue-100 bg-white shadow-[0_12px_35px_rgba(15,59,110,0.08)]">
              <div className="h-1 bg-gradient-to-r from-[#07579c] via-[#2088c7] to-[#35b89a]" />

              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#07579c]">
                        <TrainFront size={11} />
                        TIMETABLE
                      </span>

                      <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        SCHEDULED
                      </span>
                    </div>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172b4d]">
                      {trainNumber}
                    </h2>

                    <p className="mt-0.5 text-sm font-semibold text-slate-600">
                      {trainName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-emerald-600">
                      ROUTE
                    </p>

                    <p className="mt-1 max-w-[220px] truncate text-sm font-bold text-slate-800">
                      {formatStation(firstStation)}
                    </p>

                    <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-emerald-700">
                      → {formatStation(lastStation)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} />
                    {totalStations} stations
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={12} />
                    {calculatedDuration || "—"}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Navigation size={12} />
                    {distance || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* =====================================================
                TIMELINE CARD
            ===================================================== */}

            <div className="mt-4 rounded-[22px] border border-slate-100 bg-white/70 px-3 py-3 shadow-[0_8px_25px_rgba(15,59,110,0.04)] sm:px-4 sm:py-4">
              <div className="mb-4 rounded-[16px] border-b border-slate-100 px-1 pb-3 sm:px-2">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <span className="text-[7px] font-extrabold uppercase tracking-[0.18em] text-[#07579c]">
                      STATION BY STATION
                    </span>

                    <h3 className="mt-0.5 text-lg font-black tracking-tight text-[#172b4d]">
                      Journey Schedule
                    </h3>
                  </div>

                  <span className="hidden rounded-full bg-blue-50 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-[#07579c] sm:inline-flex">
                    {totalStations} stops
                  </span>
                </div>

                {/* COLUMN HEADERS */}

                <div className="mt-3 flex items-center text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  <span className="w-[58px] shrink-0 sm:w-[66px]">
                    Time
                  </span>

                  <span className="w-3 shrink-0 sm:w-4" />

                  <span className="min-w-0 flex-1">
                    Station
                  </span>

                  <span className="w-[48px] shrink-0 text-right sm:w-[56px]">
                    Halt
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                {stations.map((station, index) => (
                  <TimetableRow
                    key={`${station.code || station.station}-${index}`}
                    station={station}
                    first={index === 0}
                    last={
                      index === stations.length - 1
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {data &&
          stations.length === 0 &&
          !loading && (
            <section className="mx-auto mt-7 mb-16 max-w-[900px]">
              <div className="rounded-[26px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <TrainFront
                  size={34}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-black text-slate-800">
                  Timetable unavailable
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No station timetable information
                  was returned for this train.
                </p>
              </div>
            </section>
          )}
      </main>

      <Footer />
    </>
  );
}

/* =========================================================
   TIMETABLE ROW
========================================================= */

function TimetableRow({
  station,
  first,
  last,
}: {
  station: TimetableStation;
  first: boolean;
  last: boolean;
}) {
  const arrivalIsPlaceholder =
    isPlaceholder(station.arrival);

  const departureIsPlaceholder =
    isPlaceholder(station.departure);

  return (
    <div className="group relative flex items-start rounded-xl px-1 py-2.5 transition-all duration-200 hover:bg-slate-50/80">
      {/* =====================================================
          ARRIVAL / DEPARTURE
      ===================================================== */}

      <div className="w-[58px] shrink-0 pt-0.5 sm:w-[66px]">
        <div
          className={`text-[11px] font-semibold tabular-nums ${
            arrivalIsPlaceholder
              ? "text-slate-300"
              : "text-slate-500"
          }`}
        >
          {arrivalIsPlaceholder
            ? "—"
            : station.arrival || "—"}
        </div>

        <div
          className={`mt-0.5 text-[11px] font-semibold tabular-nums ${
            departureIsPlaceholder
              ? "text-slate-300"
              : "text-emerald-600"
          }`}
        >
          {departureIsPlaceholder
            ? "—"
            : station.departure || "—"}
        </div>
      </div>

      {/* =====================================================
          TIMELINE
      ===================================================== */}

      <div className="relative flex w-3 shrink-0 justify-center self-stretch sm:w-4">
        {!last && (
          <div className="absolute top-[26px] bottom-[-14px] w-px bg-gradient-to-b from-[#b8d3e7] to-[#dfeaf2]" />
        )}

        <div
          className={`relative z-10 mt-1 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white shadow-[0_2px_7px_rgba(15,59,110,0.12)] transition-transform duration-200 group-hover:scale-110 ${
            first
              ? "bg-[#07579c]"
              : last
                ? "bg-[#35b89a]"
                : "bg-[#b5c8d8]"
          }`}
        />
      </div>

      {/* =====================================================
          STATION INFO
      ===================================================== */}

      <div className="min-w-0 flex-1 border-b border-slate-100 pb-2.5 pl-0.5 pr-1 sm:pl-1">
        <div className="flex flex-wrap items-baseline gap-1">
          <h4 className="text-[14px] font-bold leading-tight text-[#172b4d] sm:text-[15px]">
            {station.station}
          </h4>

          {station.code && (
            <span className="text-[9px] font-semibold text-slate-400">
              ({station.code})
            </span>
          )}

          {first && (
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-wider text-[#07579c]">
              Origin
            </span>
          )}

          {last && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-wider text-emerald-700">
              Destination
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {station.distance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-semibold text-indigo-600 sm:text-[9px]">
              <Milestone size={9} />
              {station.distance}
            </span>
          )}

          {station.day && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
              Day {station.day}
            </span>
          )}

          {station.avgDelay &&
            station.avgDelay !== "-" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-1.5 py-0.5 text-[8px] font-semibold text-cyan-700 sm:text-[9px]">
                <TrendingUp size={9} />
                Avg delay: {station.avgDelay}
              </span>
            )}
        </div>
      </div>

      {/* =====================================================
          HALT
      ===================================================== */}

      <div className="w-[48px] shrink-0 pt-0.5 text-right sm:w-[56px]">
        <div className="text-[11px] font-semibold tabular-nums text-slate-500">
          {isPlaceholder(station.halt)
            ? "—"
            : station.halt || "—"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NORMALIZE RESPONSE
========================================================= */

function normalizeStations(
  response: TimetableResponse | null
): TimetableStation[] {
  if (!response) {
    return [];
  }

  const raw =
    response.data ??
    response.stations ??
    response.timetable ??
    response.route;

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(isValidStationRow)
    .map((item, index) =>
      normalizeStation(item, index)
    )
    .filter(
      (station) =>
        station.station || station.code
    );
}

/* =========================================================
   VALID STATION ROW
========================================================= */

function isValidStationRow(
  item: unknown
): boolean {
  if (!Array.isArray(item)) {
    return (
      typeof item === "object" &&
      item !== null
    );
  }

  if (item.length < 9) {
    return false;
  }

  const stationName = String(
    item[1] ?? ""
  ).trim();

  const stationCode = String(
    item[2] ?? ""
  ).trim();

  const arrival = String(
    item[3] ?? ""
  ).trim();

  const departure = String(
    item[4] ?? ""
  ).trim();

  if (!stationName || !stationCode) {
    return false;
  }

  if (!arrival && !departure) {
    return false;
  }

  const combined =
    `${stationName} ${stationCode}`.toLowerCase();

  const blockedPatterns = [
    "confirm train ticket",
    "book now",
    "advertisement",
    "golden temple",
  ];

  if (
    blockedPatterns.some((pattern) =>
      combined.includes(pattern)
    )
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   NORMALIZE STATION
========================================================= */

function normalizeStation(
  item: unknown,
  index: number
): TimetableStation {
  if (Array.isArray(item)) {
    return {
      station: cleanStationName(
        String(
          item[1] ??
            `Station ${index + 1}`
        )
      ),

      code: String(
        item[2] ?? ""
      ).trim(),

      arrival: normalizeTimeValue(
        item[3]
      ),

      departure: normalizeTimeValue(
        item[4]
      ),

      halt: String(
        item[5] ?? ""
      ).trim(),

      distance: String(
        item[6] ?? ""
      ).trim(),

      avgDelay: String(
        item[7] ?? ""
      ).trim(),

      day: String(
        item[8] ?? ""
      ).trim(),
    };
  }

  if (
    typeof item === "object" &&
    item !== null
  ) {
    const value =
      item as Record<string, unknown>;

    return {
      station: cleanStationName(
        getString(value, [
          "station",
          "station_name",
          "name",
          "stationName",
        ])
      ),

      code: getString(value, [
        "code",
        "station_code",
        "stationCode",
      ]),

      arrival: normalizeTimeValue(
        getString(value, [
          "arrival",
          "arrival_time",
          "arrivalTime",
          "arr",
          "arrives",
        ])
      ),

      departure: normalizeTimeValue(
        getString(value, [
          "departure",
          "departure_time",
          "departureTime",
          "dep",
          "departs",
        ])
      ),

      halt: getString(value, [
        "halt",
        "halt_time",
        "haltTime",
      ]),

      distance: getString(value, [
        "distance",
        "distance_km",
        "km",
      ]),

      avgDelay: getString(value, [
        "avg_delay",
        "avgDelay",
        "delay",
      ]),

      day: getString(value, [
        "day",
      ]),
    };
  }

  return {
    station: `Station ${index + 1}`,
    code: "",
    arrival: "",
    departure: "",
    halt: "",
    distance: "",
    avgDelay: "",
    day: "",
  };
}

/* =========================================================
   TIME NORMALIZATION
========================================================= */

function normalizeTimeValue(
  value: unknown
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  const result = String(value).trim();

  if (!result) {
    return "";
  }

  if (
    result.toLowerCase() === "start" ||
    result.toLowerCase() === "source"
  ) {
    return "";
  }

  if (
    result.toLowerCase() === "end" ||
    result.toLowerCase() === "destination"
  ) {
    return "";
  }

  return result;
}

/* =========================================================
   JOURNEY DURATION
========================================================= */

function calculateJourneyDuration(
  stations: TimetableStation[]
): string {
  if (stations.length < 2) {
    return "";
  }

  const first = stations[0];
  const last =
    stations[stations.length - 1];

  const startMinutes =
    getAbsoluteMinutes(
      first.departure,
      first.day
    );

  const endMinutes =
    getAbsoluteMinutes(
      last.arrival,
      last.day
    );

  if (
    startMinutes === null ||
    endMinutes === null
  ) {
    return "";
  }

  let difference =
    endMinutes - startMinutes;

  if (difference < 0) {
    difference += 24 * 60;
  }

  const hours = Math.floor(
    difference / 60
  );

  const minutes = difference % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/* =========================================================
   ABSOLUTE TIME
========================================================= */

function getAbsoluteMinutes(
  time: string,
  day: string
): number | null {
  if (!time || isPlaceholder(time)) {
    return null;
  }

  const match = time.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const dayNumber =
    Number.parseInt(day, 10);

  const normalizedDay =
    Number.isFinite(dayNumber) &&
    dayNumber >= 1
      ? dayNumber
      : 1;

  return (
    (normalizedDay - 1) * 24 * 60 +
    hours * 60 +
    minutes
  );
}

/* =========================================================
   HELPERS
========================================================= */

function isPlaceholder(
  value?: string
): boolean {
  if (!value) {
    return true;
  }

  const normalized =
    value.trim().toLowerCase();

  return [
    "-",
    "—",
    "start",
    "source",
    "end",
    "destination",
  ].includes(normalized);
}

function cleanStationName(
  raw: string
): string {
  if (!raw) {
    return raw;
  }

  let name = raw.trim();

  name = name.replace(
    /^\d+\.?\s*/,
    ""
  );

  const wrapped =
    name.match(/^\((.+)\)$/);

  if (wrapped) {
    name = wrapped[1];
  }

  return name.trim();
}

function formatStation(
  station?: TimetableStation
) {
  if (!station) {
    return "—";
  }

  if (station.code) {
    return `${station.station} (${station.code})`;
  }

  return station.station;
}

function getString(
  object: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = object[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function getSuggestionName(
  train: TrainSuggestion | null
) {
  if (!train) {
    return "";
  }

  const value =
    train as TrainSuggestion & {
      train_name?: string;
      train_label?: string;
      name?: string;
    };

  return (
    value.train_name ||
    value.train_label ||
    value.name ||
    ""
  );
}

