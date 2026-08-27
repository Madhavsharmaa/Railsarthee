"use client";

import {
  Gauge,
  Radio,
  TrainFront,
  Milestone,
  DoorClosed,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TrainInput from "../../components/TrainInput";
import {
  liveStatus,
  TrainSuggestion,
} from "../../lib/api";

interface LiveStation {
  station: string;
  code: string;
  distance: string;
  platform: string;
  scheduled_arrival: string;
  actual_arrival: string;
  scheduled_departure: string;
  actual_departure: string;
  times?: string[];
  status: string;
  delay_minutes: number;
  state: "passed" | "current" | "upcoming";
  speed: number | null;
}

interface LiveStatusResponse {
  success: boolean;
  train_number: string;
  train_name?: string;
  day: string;
  current_status: string;
  current_time: string;
  current_station?: string | null;
  origin?: string;
  destination?: string;
  overall_speed: number | null;
  total_stations?: number;
  data: LiveStation[];
}

/* -------------------------------------------------------------------------- */
/* TRAIN AVERAGE SPEED                                                        */
/* -------------------------------------------------------------------------- */

function calculateAverageSpeed(
  stations: LiveStation[]
): number | null {
  if (!stations || stations.length === 0) {
    return null;
  }

  const validSpeeds = stations
    .map((s) => s.speed)
    .filter(
      (speed): speed is number =>
        typeof speed === "number" &&
        Number.isFinite(speed) &&
        speed > 0
    );

  if (validSpeeds.length === 0) {
    return null;
  }

  const totalSpeed = validSpeeds.reduce(
    (sum, speed) => sum + speed,
    0
  );

  const average = totalSpeed / validSpeeds.length;

  return Number(average.toFixed(1));
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [train, setTrain] =
    useState<TrainSuggestion | null>(
      null
    );

  const [data, setData] =
    useState<LiveStatusResponse | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const resultsRef =
    useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------------ */
  /* LOAD LIVE STATUS                                                         */
  /* ------------------------------------------------------------------------ */

  async function loadLiveStatus(
    trainNumber: string
  ) {
    if (!trainNumber) return;

    setError("");
    setData(null);
    setLoading(true);

    try {
      const result =
        await liveStatus(
          trainNumber,
          "today"
        );

      setData(
        result as LiveStatusResponse
      );
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

  /* ------------------------------------------------------------------------ */
  /* FORM SUBMIT                                                              */
  /* ------------------------------------------------------------------------ */

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!train) {
      setError(
        "Select a train from the suggestions."
      );
      return;
    }

    await loadLiveStatus(
      train.train_number
    );
  }

  /* ------------------------------------------------------------------------ */
  /* TRAIN FROM TRAINS-BETWEEN-STATIONS                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const selectedTrain =
      sessionStorage.getItem(
        "selectedLiveTrain"
      );

    if (!selectedTrain) {
      return;
    }

    sessionStorage.removeItem(
      "selectedLiveTrain"
    );

    setTrain({
      train_number:
        selectedTrain,
    });

    loadLiveStatus(
      selectedTrain
    );
  }, []);

  /* ------------------------------------------------------------------------ */
  /* SCROLL TO RESULT                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      data?.success &&
      data.data?.length
    ) {
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [data]);

  /* ------------------------------------------------------------------------ */
  /* CALCULATE TRAIN AVERAGE                                                  */
  /* ------------------------------------------------------------------------ */

  const stations =
    data?.data ?? [];

  const averageSpeed =
    calculateAverageSpeed(
      stations
    );

  const current =
    data?.current_station || "";

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Header />

      <main className="tool-page">
        <section className="tool-hero">
          <div className="eyebrow">
            RAILSARTHEE TOOL
          </div>

          <h1>
            Live Train Status
          </h1>

          <p>
            Check the current running
            status of a train.
          </p>
        </section>

        <section className="tool-card">
          <form onSubmit={submit}>
            <TrainInput
              value={train}
              onChange={setTrain}
            />

            <button
              type="submit"
              className="primary-btn wide"
              disabled={loading}
            >
              {loading
                ? "LOADING..."
                : "CHECK STATUS"}
            </button>
          </form>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
        </section>

        {data?.success &&
          stations.length > 0 && (
            <section
              ref={resultsRef}
              className="mx-auto mt-8 mb-16 w-full max-w-[930px] scroll-mt-5"
            >
              <div className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_12px_35px_rgba(15,59,110,0.08)]">
                <div className="h-1 bg-gradient-to-r from-[#07579c] via-[#2088c7] to-[#35b89a]" />

                <div className="px-5 py-5 sm:px-7">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#07579c]">
                          <Radio size={11} />
                          LIVE RUNNING
                        </span>

                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {data.day ||
                            "TODAY"}
                        </span>
                      </div>

                      <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172b4d]">
                        {data.train_number}
                      </h2>

                      <p className="mt-0.5 text-sm font-semibold text-slate-600">
                        {data.train_name ||
                          "Live Train Running Status"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-emerald-600">
                        CURRENT STATUS
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {data.current_status ||
                          "Status unavailable"}
                      </p>

                      {data.current_time && (
                        <p className="mt-1 text-xs text-slate-500">
                          {data.current_time}
                        </p>
                      )}

                      {current && (
                        <p className="mt-1 text-xs font-semibold text-emerald-700">
                          {current}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-500">
  


                    <span className="inline-flex items-center gap-1.5">
                      <TrainFront size={12} />

                      {data.total_stations ??
                        stations.length}{" "}
                      stations
                    </span>
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER WITH INCREASED CORNER PADDING & COMPACT HORIZONTAL SPACING */}
              <div className="mt-4 rounded-[28px] border border-slate-100 bg-white/70 p-4 sm:p-6 shadow-[0_8px_25px_rgba(15,59,110,0.04)]">
                <div className="mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[7px] font-extrabold uppercase tracking-[0.18em] text-[#07579c]">
                        JOURNEY TIMELINE
                      </span>

                      <h3 className="mt-0.5 text-lg font-black tracking-tight text-[#172b4d]">
                        Train Movement
                      </h3>
                    </div>

                    <span className="hidden rounded-full bg-blue-50 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-[#07579c] sm:inline-flex">
                      {stations.length}{" "}
                      stops
                    </span>
                  </div>

                  <div className="mt-3 flex items-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    <span className="w-[0px] shrink-0 sm:w-[58px]">
                      Sched.
                    </span>

                    <span className="w-5 shrink-0 text-center sm:w-6" />

                    <span className="min-w-0 flex-1 pl-1">
                      Station
                    </span>

                    <span className="w-[50px] shrink-0 text-right sm:w-[58px]">
                      Actual
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {stations.map(
                    (
                      station,
                      index
                    ) => (
                      <StationRow
                        key={`${station.code || station.station}-${index}`}
                        station={station}
                        first={
                          index === 0
                        }
                        last={
                          index ===
                          stations.length - 1
                        }
                      />
                    )
                  )}
                </div>
              </div>
            </section>
          )}
      </main>

      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* STATION ROW                                                                */
/* -------------------------------------------------------------------------- */

function StationRow({
  station,
  first,
  last,
}: {
  station: LiveStation;
  first: boolean;
  last: boolean;
}) {
  const status =
    getStatus(
      station.status,
      station.delay_minutes
    );

  const scheduledArrival =
    station.scheduled_arrival || "";

  const scheduledDeparture =
    station.scheduled_departure || "";

  const actualArrival =
    station.actual_arrival ||
    station.times?.[0] ||
    "";

  const actualDeparture =
    station.actual_departure ||
    station.times?.[1] ||
    "";

  const arrivalDelayed =
    !!actualArrival &&
    !!scheduledArrival &&
    scheduledArrival !== "SOURCE" &&
    actualArrival !== scheduledArrival &&
    status.kind === "delay";

  const departureDelayed =
    !!actualDeparture &&
    !!scheduledDeparture &&
    scheduledDeparture !== "DESTINATION" &&
    actualDeparture !== scheduledDeparture &&
    status.kind === "delay";

  return (
    <div className="group relative flex items-start rounded-xl px-1 py-2 transition-all duration-200 hover:bg-slate-50/80">
      <div className="w-[50px] shrink-0 pt-0.5 sm:w-[58px]">
        <div className="text-[11px] font-semibold tabular-nums text-slate-500">
          {scheduledArrival ===
          "SOURCE"
            ? "—"
            : scheduledArrival ||
              "—"}
        </div>

        <div className="mt-0.5 text-[11px] font-semibold tabular-nums text-emerald-600">
          {scheduledDeparture ===
          "DESTINATION"
            ? "—"
            : scheduledDeparture ||
              "—"}
        </div>
      </div>

      <div className="relative flex w-5 shrink-0 justify-center self-stretch sm:w-6">
        {!last && (
          <div className="absolute top-[26px] bottom-[-14px] w-px bg-gradient-to-b from-[#b8d3e7] to-[#dfeaf2]" />
        )}

        <div
          className={`relative z-10 mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full border-[3px] border-white shadow-[0_2px_7px_rgba(15,59,110,0.12)] transition-transform duration-200 group-hover:scale-110 ${
            station.state ===
            "current"
              ? "bg-[#07579c] ring-4 ring-blue-50"
              : station.state ===
                "passed"
                ? "bg-[#35b89a]"
                : "bg-[#b5c8d8]"
          }`}
        >
          {station.state ===
            "current" && (
            <Radio
              size={8}
              className="text-white"
            />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 border-b border-slate-100 pb-2.5 pl-1.5 pr-1 sm:pl-2">
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

          {station.state ===
            "current" && (
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-wider text-[#07579c]">
              Current
            </span>
          )}

          {last && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-wider text-emerald-700">
              Destination
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1">
          {station.distance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-semibold text-indigo-600 sm:text-[9px]">
              <Milestone size={9} />
              {station.distance}
            </span>
          )}

          {station.platform && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-1.5 py-0.5 text-[8px] font-semibold text-cyan-700 sm:text-[9px]">
              <DoorClosed size={9} />
              PF {station.platform}
            </span>
          )}

          {station.speed != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-1.5 py-0.5 text-[8px] font-semibold text-violet-700 sm:text-[9px]">
              <Zap size={9} />
              {station.speed} km/h
            </span>
          )}
        </div>

        <div className="mt-1">
          <span
            className={`text-[9px] font-semibold ${
              status.kind === "delay"
                ? "text-rose-500"
                : "text-emerald-600"
            }`}
          >
            {status.text}
          </span>
        </div>
      </div>

      <div className="w-[50px] shrink-0 pt-0.5 text-right sm:w-[58px]">
        <div
          className={`text-[11px] font-semibold tabular-nums ${
            arrivalDelayed
              ? "text-rose-500"
              : "text-slate-500"
          }`}
        >
          {actualArrival ||
            "—"}
        </div>

        <div
          className={`mt-0.5 text-[11px] font-semibold tabular-nums ${
            departureDelayed
              ? "text-rose-500"
              : "text-emerald-600"
          }`}
        >
          {actualDeparture ||
            "—"}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS                                                                     */
/* -------------------------------------------------------------------------- */

function getStatus(
  value: string = "",
  delayMinutes?: number
) {
  const s = value.toLowerCase();

  const isNegative =
    (typeof delayMinutes === "number" && delayMinutes <= 0) ||
    s.includes("delayed by -") ||
    s.includes("-");

  if (isNegative) {
    return {
      kind: "ontime",
      dot: "bg-emerald-400",
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      text: "Right Time",
    };
  }

  if (
    (typeof delayMinutes === "number" && delayMinutes > 0) ||
    s.includes("delay") ||
    s.includes("late")
  ) {
    return {
      kind: "delay",
      dot: "bg-rose-400",
      badge:
        "bg-rose-50 text-rose-600 border border-rose-200",
      text:
        value || "Delayed",
    };
  }

  return {
    kind: "ontime",
    dot: "bg-emerald-400",
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    text:
      value || "Right Time",
  };
}