"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  TrainFront,
  X,
} from "lucide-react";

import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import TrainsBetweenSearch from "../../../../components/TrainsBetweenSearch";
import { API_BASE, searchStations } from "../../../../lib/api";

interface TrainEntry {
  train_number: string;
  duration:
    | string
    | {
        display?: string;
        hours?: number;
        minutes?: number;
        total_minutes?: number;
      };
  route: {
    from: string;
    to: string;
  };
  running_days: string[];
  train_name?: string;
  train_label?: string;
  from?: {
    code?: string;
    name?: string;
    departure_time?: string;
  };
  to?: {
    code?: string;
    name?: string;
    arrival_time?: string;
  };
}

interface Data {
  from_station: string;
  to_station: string;
  success: boolean;
  total: number;
  trains: TrainEntry[];
  statistics: {
    average: number;
    minimum: {
      duration: number;
      train_number: string;
    };
    maximum: {
      duration: number;
      train_number: string;
    };
  };
  error?: string;
}

type Sort =
  | "fastest"
  | "departure-early"
  | "departure-last"
  | "arrival-early"
  | "arrival-last";

function durationMinutes(value: TrainEntry["duration"]) {
  if (typeof value === "object" && value)
    return Number(value.total_minutes) || 0;
  const match = String(value || "").match(/(\d+):(\d+)/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

function timeMinutes(value?: string) {
  if (!value) return 0;
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

function dayFromDate(date: string) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "short" }
  );
}

function runsOnDate(train: TrainEntry, date: string) {
  if (!date) return true;

  const day = dayFromDate(date).toLowerCase();

  return train.running_days?.some(
    (d) => d.toLowerCase().slice(0, 3) === day
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = use(params);

  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();

  const [data, setData] = useState<Data | null>(null);
  const [fromName, setFromName] = useState(fromCode);
  const [toName, setToName] = useState(toCode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<Sort>("fastest");
  const [date, setDate] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const dateRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);


  useEffect(() => {
    const loadStationNames = async () => {
      try {
        const [fromRes, toRes] = await Promise.all([
          searchStations(fromCode),
          searchStations(toCode),
        ]);

        const fromStation = fromRes.find(
          s => s.code.toUpperCase() === fromCode
        );

        const toStation = toRes.find(
          s => s.code.toUpperCase() === toCode
        );

        setFromName(fromStation?.name || fromCode);
        setToName(toStation?.name || toCode);
      } catch {
        setFromName(fromCode);
        setToName(toCode);
      }
    };

    loadStationNames();
  }, [fromCode, toCode]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setData(null);
      setError("");

      try {
        const [fromStations, toStations, response] =
          await Promise.all([
            searchStations(fromCode),
            searchStations(toCode),
            fetch(
              `${API_BASE}/api/trains-between/${encodeURIComponent(
                fromCode
              )}/${encodeURIComponent(toCode)}`,
              {
                cache: "no-store",
                headers: {
                  Accept: "application/json",
                },
              }
            ),
          ]);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || `Request failed (${response.status})`
          );
        }

        if (cancelled) return;

        const fs = fromStations.find(
          (s) => s.code?.toUpperCase() === fromCode
        );

        const ts = toStations.find(
          (s) => s.code?.toUpperCase() === toCode
        );

        setFromName(fs?.name || fromCode);
        setToName(ts?.name || toCode);

        if (!result.success || !result.trains?.length) {
          setError(
            result.error ||
              "No trains are available for this route."
          );
          return;
        }

        setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Unable to load trains."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fromCode, toCode]);


  useEffect(() => {
  if (data?.success && data.trains?.length) {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}, [data]);

  const trains = useMemo(() => {
    if (!data?.trains) return [];

    let result = data.trains.filter((train) =>
      runsOnDate(train, date)
    );

    result.sort((a, b) => {
      const ad = durationMinutes(a.duration);
      const bd = durationMinutes(b.duration);

      switch (sort) {
        case "fastest":
          return ad - bd;

        case "departure-early":
          return (
            timeMinutes(a.from?.departure_time) -
            timeMinutes(b.from?.departure_time)
          );

        case "departure-last":
          return (
            timeMinutes(b.from?.departure_time) -
            timeMinutes(a.from?.departure_time)
          );

        case "arrival-early":
          return (
            timeMinutes(a.to?.arrival_time) -
            timeMinutes(b.to?.arrival_time)
          );

        case "arrival-last":
          return (
            timeMinutes(b.to?.arrival_time) -
            timeMinutes(a.to?.arrival_time)
          );

        default:
          return 0;
      }
    });

    return result;
  }, [data, date, sort]);

  const sortLabels: Record<Sort, string> = {
    fastest: "Fastest",
    "departure-early": "Departure Early",
    "departure-last": "Departure Last",
    "arrival-early": "Arrival Early",
    "arrival-last": "Arrival Last",
  };

  function openDate() {
    const input = dateRef.current;

    if (!input) return;

    if ("showPicker" in input) {
      (input as HTMLInputElement).showPicker();
    } else {
      (input as HTMLInputElement).focus();
    }
  }

  return (
    <>
      <Header />

      <main className="bw-page">
        <section className="bw-hero">
          <div className="bw-hero-inner">
            <div className="bw-eyebrow">
              RAILSARTHI TOOL
            </div>

            <h1>Trains Between Stations</h1>

            <p>
              Find trains, journey duration and running
              days between your selected stations.
            </p>

            <TrainsBetweenSearch
              initialFrom={{
                name: fromName,
                code: fromCode,
              }}
              initialTo={{
                name: toName,
                code: toCode,
              }}
            />

            <div className="bw-route-badge">
              <strong>{fromName}</strong>
              <span>({fromCode})</span>
              <ArrowRight size={14} />
              <strong>{toName}</strong>
              <span>({toCode})</span>
            </div>
          </div>
        </section>

        <section ref={resultsRef} className="bw-results">
          {loading && (
            <div className="bw-loading">
              <div className="bw-spinner" />
              <span>Searching trains...</span>
            </div>
          )}

          {!loading && error && (
            <div className="bw-state bw-error">
              <TrainFront size={22} />
              <h2>No trains available</h2>
              <p>{error}</p>

              <Link
                href="/trains-between"
                className="bw-retry"
              >
                Search Again
              </Link>
            </div>
          )}

          {!loading && data && !error && (
            <>
              <div className="bw-results-title">
                <div>
                  <span>SEARCH RESULTS</span>
                  <h2>{trains.length} Trains Found</h2>
                </div>

                <div className="bw-small-route">
                  <strong>{fromCode}</strong>
                  <ArrowRight size={13} />
                  <strong>{toCode}</strong>
                </div>
              </div>

              <div className="bw-filter-bar">
                <div className="bw-filter-wrap">
                  <button
                    type="button"
                    className={
                      filterOpen
                        ? "bw-filter-button active"
                        : "bw-filter-button"
                    }
                    onClick={() =>
                      setFilterOpen((v) => !v)
                    }
                  >
                    <Filter size={15} />
                    {sortLabels[sort]}
                    <ChevronDown size={14} />
                  </button>

                  {filterOpen && (
                    <div className="bw-filter-menu">
                      {(
                        Object.entries(
                          sortLabels
                        ) as [Sort, string][]
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setSort(value);
                            setFilterOpen(false);
                          }}
                        >
                          {label}

                          {sort === value && (
                            <Check size={14} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="bw-date-filter"
                  onClick={openDate}
                >
                  <CalendarDays size={15} />

                  <span>
                    {date
                      ? new Date(
                          `${date}T00:00:00`
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Select Date"}
                  </span>

                  <input
                    ref={dateRef}
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                  />
                </div>

                {(date || sort !== "fastest") && (
                  <button
                    type="button"
                    className="bw-clear-filter"
                    onClick={() => {
                      setDate("");
                      setSort("fastest");
                    }}
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>

              {date && (
                <div className="bw-date-info">
                  <CalendarDays size={14} />
                  Showing trains running on{" "}
                  <strong>
                    {new Date(
                      `${date}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </strong>
                </div>
              )}

              {trains.length === 0 ? (
                <div className="bw-filter-empty">
                  <CalendarDays size={22} />
                  <h3>No trains on this date</h3>
                  <p>
                    No train in this route runs on
                    the selected day.
                  </p>

                  <button
                    type="button"
                    onClick={() => setDate("")}
                  >
                    Show All Trains
                  </button>
                </div>
              ) : (
                <div className="bw-trains">
                  {trains.map((train) => {
                    const days = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ];

                    const running =
                      train.running_days || [];

                    const fromStation =
                      train.from?.code ||
                      train.route?.from ||
                      fromCode;

                    const toStation =
                      train.to?.code ||
                      train.route?.to ||
                      toCode;

                    return (
                      <article
                        key={train.train_number}
                        className="bw-train"
                      >
                        <div className="bw-train-top">
                          <div className="bw-train-main">
                            <span className="bw-train-number">
                              {train.train_number}
                            </span>

                            <div className="bw-train-name">
                              <h3>
                                {train.train_name ||
                                  train.train_label ||
                                  `Train ${train.train_number}`}
                              </h3>
                            </div>
                          </div>

                          <div className="bw-running-days">
                            <span className="bw-days-label">
                              RUNNING DAYS
                            </span>

                            <div className="bw-days-list">
                              {days.map((day) => {
                                const active =
                                  running.some(
                                    (d) =>
                                      d
                                        .toLowerCase()
                                        .slice(0, 3) ===
                                      day
                                        .toLowerCase()
                                        .slice(0, 3)
                                  );

                                return (
                                  <span
                                    key={day}
                                    className={
                                      active
                                        ? "bw-day active"
                                        : "bw-day inactive"
                                    }
                                  >
                                    {day}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="bw-live"
                            onClick={() => {
                              sessionStorage.setItem(
                                "selectedLiveTrain",
                                train.train_number
                              );

                              window.location.href = "/live-status";
                            }}
                          >
                            Live Status
                            <ArrowRight size={16} />
                          </button>
                        </div>

                        <div className="bw-train-bottom">
                          <div className="bw-station">
                            <span className="bw-station-code">
                              {fromStation}
                            </span>

                            <div className="bw-station-info">
                              <strong>
                                {train.from?.name ||
                                  fromName}
                              </strong>

                              <span className="bw-time-label">
                                DEPARTURE
                              </span>

                              <strong className="bw-station-time">
                                {train.from
                                  ?.departure_time ||
                                  "00:00"}
                              </strong>
                            </div>
                          </div>

                          <div className="bw-route-line-small">
                            <span />
                            <ArrowRight size={20} />
                            <span />
                          </div>

                          <div className="bw-station">
                            <span className="bw-station-code">
                              {toStation}
                            </span>

                            <div className="bw-station-info">
                              <strong>
                                {train.to?.name ||
                                  toName}
                              </strong>

                              <span className="bw-time-label">
                                ARRIVAL
                              </span>

                              <strong className="bw-station-time">
                                {train.to
                                  ?.arrival_time ||
                                  "00:00"}
                              </strong>
                            </div>
                          </div>

                          <div className="bw-duration">
                            <Clock3 size={20} />

                            <div>
                              <span>
                                JOURNEY DURATION
                              </span>

                              <strong>
                                {typeof train.duration === "object"
                                  ? train.duration.display || "00:00 hr"
                                  : train.duration || "00:00 hr"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}