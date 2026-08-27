"use client";

import {
  ArrowDown,
  ArrowUp,
  BedDouble,
  Luggage,
  TrainFront,
  Utensils,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TrainInput from "../../components/TrainInput";
import CoachesLayout from "../../components/CoachesLayout";

import {
  coachPosition,
  TrainSuggestion,
} from "../../lib/api";

interface CoachData {
  data: string[][];
  success: boolean;
  train_number: string;
  train_name?: string;
}

interface Coach {
  position: string;
  code: string;
  name: string;
  type: string;
}

type CoachKind =
  | "engine"
  | "power"
  | "general"
  | "sleeper"
  | "buffet"
  | "ac3"
  | "ac2"
  | "ac1"
  | "other";

export default function Page() {
  const [train, setTrain] =
    useState<TrainSuggestion | null>(null);
  const [data, setData] =
    useState<CoachData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] =
    useState<Coach | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!train) {
      setError("Select a train from the suggestions.");
      return;
    }

    setError("");
    setData(null);
    setSelectedCoach(null);
    setLoading(true);

    try {
      const result = await coachPosition(train.train_number);
      setData(result as CoachData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (data?.success && data.data?.length) {
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [data]);

  const coaches = useMemo<Coach[]>(
    () =>
      data?.data
        ?.map((item) => ({
          position: item[0] || "",
          code: item[1] || "",
          name: item[2] || "Coach",
          type: item[3] || "",
        }))
        .filter((coach) => coach.code || coach.name) || [],
    [data]
  );

  function getCoachKind(
    code: string,
    name: string,
    type: string
  ): CoachKind {
    const value = name.toLowerCase();
    const coachCode = code.trim().toUpperCase();
    const coachType = type.trim().toUpperCase();

    if (
      coachCode === "ENG" ||
      value.includes("engine")
    )
      return "engine";

    if (
      ["PWR", "SLR", "LRD", "DL", "EOG", "HOG"].includes(
        coachCode
      ) ||
      value.includes("brake") ||
      value.includes("luggage") ||
      value.includes("generator")
    )
      return "power";

    if (
      ["GS", "GN", "GEN", "GENERAL"].includes(coachCode) ||
      value.includes("general") ||
      value.includes("unreserved")
    )
      return "general";

    if (
      /^M\d*$/.test(coachCode) ||
      coachCode === "3E" ||
      coachType.includes("3E") ||
      value.includes("3 tier economy") ||
      value.includes("3-tier economy") ||
      value.includes("economy")
    )
      return "ac3";

    if (
      /^S\d+$/.test(coachCode) ||
      value.includes("sleeper")
    )
      return "sleeper";

    if (
      /^B\d+$/.test(coachCode) ||
      coachCode === "3A" ||
      coachType.includes("3A") ||
      value.includes("ac 3 tier") ||
      value.includes("three tier")
    )
      return "ac3";

    if (
      /^A\d+$/.test(coachCode) ||
      coachCode === "2A" ||
      coachType.includes("2A") ||
      value.includes("ac 2 tier") ||
      value.includes("two tier")
    )
      return "ac2";

    if (
      /^H\d+$/.test(coachCode) ||
      coachCode === "1A" ||
      value.includes("first class") ||
      value.includes("first ac")
    )
      return "ac1";

    if (
      coachCode === "PC" ||
      value.includes("buffet") ||
      value.includes("pantry")
    )
      return "buffet";

    return "other";
  }

  function getCoachIcon(kind: CoachKind) {
    switch (kind) {
      case "engine":
        return <TrainFront size={18} />;
      case "power":
        return <Luggage size={18} />;
      case "general":
        return <Users size={18} />;
      case "sleeper":
      case "ac3":
      case "ac2":
      case "ac1":
        return <BedDouble size={18} />;
      case "buffet":
        return <Utensils size={18} />;
      default:
        return <Users size={18} />;
    }
  }

  function getClassLabel(kind: CoachKind) {
    return {
      engine: "ENGINE",
      power: "LUGGAGE",
      general: "GENERAL",
      sleeper: "SLEEPER",
      buffet: "BUFFET",
      ac3: "AC 3-TIER",
      ac2: "AC 2-TIER",
      ac1: "AC FIRST",
      other: "COACH",
    }[kind];
  }

  function getTrainName() {
    const selected = train as
      | (TrainSuggestion & {
          train_name?: string;
          name?: string;
        })
      | null;

    return (
      data?.train_name ||
      selected?.train_name ||
      selected?.name ||
      ""
    );
  }

  function getCoachStyles(kind: CoachKind) {
    const styles = {
      engine: [
        "bg-orange-50 border-orange-200",
        "bg-orange-100 text-orange-600 border-orange-200",
        "text-orange-700",
        "bg-orange-100 text-orange-700",
      ],
      power: [
        "bg-slate-50 border-slate-200",
        "bg-slate-100 text-slate-600 border-slate-200",
        "text-slate-700",
        "bg-slate-100 text-slate-600",
      ],
      general: [
        "bg-green-50 border-green-200",
        "bg-green-100 text-green-700 border-green-200",
        "text-green-700",
        "bg-green-100 text-green-700",
      ],
      sleeper: [
        "bg-emerald-50 border-emerald-200",
        "bg-emerald-100 text-emerald-700 border-emerald-200",
        "text-emerald-700",
        "bg-emerald-100 text-emerald-700",
      ],
      ac3: [
        "bg-blue-50 border-blue-200",
        "bg-blue-100 text-blue-700 border-blue-200",
        "text-blue-700",
        "bg-blue-100 text-blue-700",
      ],
      ac2: [
        "bg-violet-50 border-violet-200",
        "bg-violet-100 text-violet-700 border-violet-200",
        "text-violet-700",
        "bg-violet-100 text-violet-700",
      ],
      ac1: [
        "bg-pink-50 border-pink-200",
        "bg-pink-100 text-pink-700 border-pink-200",
        "text-pink-700",
        "bg-pink-100 text-pink-700",
      ],
      buffet: [
        "bg-amber-50 border-amber-200",
        "bg-amber-100 text-amber-700 border-amber-200",
        "text-amber-700",
        "bg-amber-100 text-amber-700",
      ],
      other: [
        "bg-white border-slate-200",
        "bg-slate-100 text-slate-600 border-slate-200",
        "text-slate-700",
        "bg-slate-100 text-slate-600",
      ],
    };

    const [row, icon, code, badge] = styles[kind];
    return { row, icon, code, badge };
  }

  return (
    <>
      <Header />

      <main className="tool-page">
        <section className="tool-hero">
          <div className="eyebrow">RAILSARTHI TOOL</div>
          <h1>Coach Position</h1>
          <p>
            Find coach position information for your selected train.
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
                : "GET COACH POSITION"}
            </button>
          </form>

          {error && (
            <div className="error-box">{error}</div>
          )}
        </section>

        {data?.success && (
          <section
            ref={resultsRef}
            className="
              mx-auto mt-8 mb-16 w-full max-w-[1180px] scroll-mt-6
            "
          >
            <div
              className="
                flex items-center justify-between gap-5
                rounded-t-2xl border border-slate-200
                bg-white px-6 py-5 shadow-sm
              "
            >
              <div>
                <span
                  className="
                    mb-1 block text-[10px] font-extrabold
                    tracking-[1.7px] text-slate-500
                  "
                >
                  TRAIN COMPOSITION
                </span>

                <h2
                  className="
                    text-2xl font-black tracking-tight text-slate-800
                  "
                >
                  {data.train_number}
                </h2>

                {getTrainName() && (
                  <p className="mt-1 text-xs text-slate-500">
                    {getTrainName()}
                  </p>
                )}
              </div>

              <div
                className="
                  min-w-[78px] rounded-xl border border-slate-200
                  bg-slate-50 px-4 py-2.5 text-center
                "
              >
                <strong
                  className="
                    block text-2xl font-black leading-none text-slate-800
                  "
                >
                  {coaches.length}
                </strong>

                <span
                  className="
                    mt-1 block text-[8px] font-extrabold
                    tracking-widest text-slate-500
                  "
                >
                  COACHES
                </span>
              </div>
            </div>

            <div
              className="
                grid grid-cols-1 gap-5 rounded-b-2xl
                border-x border-b border-slate-200
                bg-slate-50/60 p-5
                lg:grid-cols-[310px_minmax(0,1fr)]
              "
            >
              {/* LEFT */}
              <div
                className="
                  rounded-2xl border border-slate-200
                  bg-white p-5 shadow-sm
                "
              >
                <div
                  className="
                    flex items-center justify-between gap-3
                    border-b border-slate-100 pb-4
                  "
                >
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      Train Structure
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      From Engine to Last Coach
                    </p>
                  </div>

                  <span
                    className="
                      rounded-md border border-blue-100
                      bg-blue-50 px-2 py-1
                      text-[9px] font-extrabold text-blue-600
                    "
                  >
                    {data.train_number}
                  </span>
                </div>

                <div className="relative mt-4 px-3">
                  <div
                    className="
                      relative z-10 mb-2 flex flex-col
                      items-center text-slate-500
                    "
                  >
                    <ArrowUp size={15} strokeWidth={2.3} />
                    <span className="text-[7px] font-black tracking-[1.2px]">
                      FRONT
                    </span>
                  </div>

                  <div className="relative z-10">
                    {coaches.map((coach, index) => {
                      const kind = getCoachKind(
                        coach.code,
                        coach.name,
                        coach.type
                      );

                      const styles = getCoachStyles(kind);

                      return (
                        <div
                          key={`structure-${coach.position}-${coach.code}-${index}`}
                          className="
                            relative flex min-h-[62px]
                            items-center justify-center
                          "
                        >
                          {/* CLICKABLE LEFT COACH */}
                          <button
                            type="button"
                            onClick={() => setSelectedCoach(coach)}
                            className={`
                              ${styles.row}
                              relative z-10 flex w-[82%] min-h-[48px]
                              cursor-pointer items-center gap-2.5
                              rounded-lg border px-2.5 py-2 text-left
                              shadow-sm transition-all duration-200
                              hover:translate-x-1 hover:shadow-md
                              focus:outline-none focus:ring-2
                              focus:ring-blue-300
                            `}
                          >
                            <div
                              className={`
                                ${styles.icon}
                                flex h-8 w-8 shrink-0 items-center
                                justify-center rounded-md border
                              `}
                            >
                              {getCoachIcon(kind)}
                            </div>

                            <div className="flex min-w-0 flex-col">
                              <strong
                                className={`
                                  ${styles.code}
                                  text-xs font-black leading-none
                                `}
                              >
                                {coach.code || "—"}
                              </strong>

                              <span
                                className="
                                  mt-1 truncate text-[8px] text-slate-500
                                "
                              >
                                {coach.name || "Coach"}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="
                      relative z-10 mt-2 flex flex-col
                      items-center text-slate-500
                    "
                  >
                    <ArrowDown size={15} strokeWidth={2.3} />
                    <span className="text-[7px] font-black tracking-[1.2px]">
                      REAR
                    </span>
                  </div>

                  <div className="relative mx-auto mt-2 h-8 w-14">
                    <div className="absolute left-3 top-0 h-8 w-[3px] rotate-[2deg] rounded bg-slate-500/60" />
                    <div className="absolute right-3 top-0 h-8 w-[3px] -rotate-[2deg] rounded bg-slate-500/60" />
                    <div className="absolute left-1 top-1 h-[3px] w-12 rounded bg-slate-500/50" />
                    <div className="absolute left-1 top-2.5 h-[3px] w-12 rounded bg-slate-500/50" />
                    <div className="absolute left-1 top-4 h-[3px] w-12 rounded bg-slate-500/50" />
                    <div className="absolute left-1 top-5.5 h-[3px] w-12 rounded bg-slate-500/50" />
                    <div className="absolute left-1 top-7 h-[3px] w-12 rounded bg-slate-500/50" />
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div
                className="
                  min-w-0 overflow-hidden rounded-2xl
                  border border-slate-200 bg-white shadow-sm
                "
              >
                {selectedCoach === null ? (
                  <div className="p-5">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-extrabold text-slate-800">
                        Coach Composition
                        <span className="ml-2 text-xs font-medium text-slate-500">
                          ({coaches.length} Coaches)
                        </span>
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Train No: {data.train_number}
                        {getTrainName()
                          ? ` - ${getTrainName()}`
                          : ""}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-col gap-1.5">
                      {coaches.map((coach, index) => {
                        const kind = getCoachKind(
                          coach.code,
                          coach.name,
                          coach.type
                        );

                        const styles = getCoachStyles(kind);

                        const className = coach.type
                          ? coach.type.replace("_LHB", "")
                          : getClassLabel(kind);

                        return (
                          <button
                            type="button"
                            key={`composition-${coach.position}-${coach.code}-${index}`}
                            onClick={() =>
                              setSelectedCoach(coach)
                            }
                            className={`
                              ${styles.row}
                              grid min-h-[39px] w-full cursor-pointer
                              grid-cols-[30px_30px_52px_minmax(100px,1fr)_auto]
                              items-center gap-2 rounded-lg border
                              px-2 py-1 text-left transition-all duration-150
                              hover:-translate-y-[1px]
                              hover:translate-x-0.5 hover:shadow-md
                              focus:outline-none focus:ring-2
                              focus:ring-blue-300
                            `}
                          >
                            <div
                              className="
                                flex h-7 w-7 items-center justify-center
                                rounded-md border border-slate-200
                                bg-white/70 text-[9px] font-extrabold
                                text-slate-500
                              "
                            >
                              {coach.position || "—"}
                            </div>

                            <div
                              className={`
                                ${styles.code}
                                flex items-center justify-center
                              `}
                            >
                              {getCoachIcon(kind)}
                            </div>

                            <div
                              className={`
                                ${styles.code} text-[13px] font-black
                              `}
                            >
                              {coach.code || "—"}
                            </div>

                            <div
                              className="
                                min-w-0 truncate text-[10px] text-slate-600
                              "
                            >
                              {coach.name || "—"}
                            </div>

                            <div className="flex justify-end">
                              <span
                                className={`
                                  ${styles.badge}
                                  max-w-[90px] truncate rounded-md
                                  px-2 py-1 text-[8px] font-extrabold
                                  uppercase
                                `}
                              >
                                {className}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className="
                        flex items-center justify-between
                        border-b border-slate-100 bg-white
                        px-5 py-3
                      "
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCoach(null)}
                        className="
                          flex items-center gap-2 rounded-lg
                          px-3 py-2 text-xs font-bold text-slate-600
                          transition-all hover:bg-slate-100
                          hover:text-slate-900
                        "
                      >
                        <span className="text-base leading-none">
                          ←
                        </span>
                        Back to Coaches
                      </button>

                      <span
                        className="
                          rounded-md bg-slate-100 px-2.5 py-1.5
                          text-[8px] font-extrabold uppercase
                          tracking-widest text-slate-500
                        "
                      >
                        Coach Details
                      </span>
                    </div>

                    <div className="p-5">
                      <CoachesLayout coach={selectedCoach} />
                    </div>
                  </div>
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