"use client";

import {
  Armchair,
  BedDouble,
  Crown,
  DoorOpen,
  Luggage,
  TrainFront,
  Users,
} from "lucide-react";

interface Coach {
  position: string;
  code: string;
  name: string;
  type: string;
}

type CoachLayoutType =
  | "AC1"
  | "AC2"
  | "AC3"
  | "AC3E"
  | "SLEEPER"
  | "CC"
  | "EC"
  | "2S"
  | "EA"
  | "EV"
  | "HA"
  | "GENERAL"
  | "UTILITY"
  | "PANTRY"
  | "PARCEL"
  | "RMS"
  | "UNKNOWN";

interface CoachesLayoutProps {
  coach: Coach;
}

/* =========================================================
   COACH TYPE DETECTION
========================================================= */

/* =========================================================
   EXTRA COACH NORMALIZATION

   If "E" appears at index 1 of the code (e.g. BE1, AE1, CE1),
   it marks the coach as an "extra" coach of that base type —
   it is NOT a different coach class. We strip the "E" so the
   rest of detection treats it exactly like its base type:

     BE1 -> B1  (extra AC 3 Tier)
     AE1 -> A1  (extra AC 2 Tier)
     CE1 -> C1  (extra Chair Car)
     HE1 -> H1  (extra First AC)
     DE1 -> D1  (extra Second Sitting)
     SE1 -> S1  (extra Sleeper)
     ME1 -> M1  (extra AC 3 Economy)

   NOTE: this only fires when index 0 is a letter and index 2+
   is numeric — this avoids clashing with codes that are
   inherently "*E" typed, e.g. EA, EC, EV, 3E which don't have
   a leading base-type letter followed by E then digits.
========================================================= */

function normalizeExtraCoach(rawCode: string): string {
  const code = rawCode.trim().toUpperCase();

  const match = /^([A-Z])E(\d+)$/.exec(code);

  if (match) {
    const [, baseLetter, digits] = match;
    return `${baseLetter}${digits}`;
  }

  return code;
}

function detectCoachType(coach: Coach): CoachLayoutType {
  const code = normalizeExtraCoach(coach.code || "");
  const name = (coach.name || "").trim().toLowerCase();
  const type = (coach.type || "").trim().toUpperCase();

  /* =======================================================
     FIRST AC
     IMPORTANT:
     HCP MUST BE CHECKED BEFORE PARCEL
  ======================================================= */

  if (
    code === "H" ||
    code === "1A" ||
    /^H\d+$/.test(code) ||
    name.includes("first ac") ||
    name.includes("first class")
  ) {
    return "AC1";
  }

  /* =======================================================
     GENERAL
  ======================================================= */

  if (
    code === "GS" ||
    code === "GN" ||
    code === "GEN" ||
    code === "GENERAL" ||
    name.includes("general") ||
    name.includes("unreserved")
  ) {
    return "GENERAL";
  }

  /* =======================================================
     AC 3 TIER ECONOMY
     GARIB RATH 3A ALSO USES THIS FOR NOW
  ======================================================= */

  if (
    /^M\d*$/.test(code) ||
    code === "M" ||
    code === "3E" ||
    code === "3ECO" ||
    name.includes("3 tier economy") ||
    name.includes("3-tier economy") ||
    name.includes("three tier economy") ||
    name.includes("economy") ||
    name.includes("garib rath")
  ) {
    return "AC3E";
  }

  /* =======================================================
     AC 3 TIER
  ======================================================= */

  if (
    /^B\d+$/.test(code) ||
    code === "B" ||
    code === "3A" ||
    type.includes("3A") ||
    name.includes("ac 3 tier") ||
    name.includes("ac three tier") ||
    name.includes("three tier")
  ) {
    return "AC3";
  }

  /* =======================================================
     SLEEPER
  ======================================================= */

  if (
    /^S\d+$/.test(code) ||
    code === "SL" ||
    name.includes("sleeper")
  ) {
    return "SLEEPER";
  }

  /* =======================================================
     AC 2 TIER
  ======================================================= */

  if (
    /^A\d+$/.test(code) ||
    code === "A" ||
    code === "2A" ||
    type.includes("2A") ||
    name.includes("ac 2 tier") ||
    name.includes("ac two tier") ||
    name.includes("two tier")
  ) {
    return "AC2";
  }

  /* =======================================================
     HA COMPOSITE
  ======================================================= */

  if (
    /^HA\d*$/.test(code) ||
    code === "HA" ||
    name.includes("composite")
  ) {
    return "HA";
  }

  /* =======================================================
     EXECUTIVE CHAIR CAR
  ======================================================= */

  if (
    /^E\d+$/.test(code) ||
    code === "E" ||
    code === "EC" ||
    type.includes("EC") ||
    name.includes("executive")
  ) {
    return "EC";
  }

  /* =======================================================
     ANUBHUTI
  ======================================================= */

  if (
    /^EA\d*$/.test(code) ||
    code === "EA" ||
    code === "K" ||
    name.includes("anubhuti")
  ) {
    return "EA";
  }

  /* =======================================================
     VISTADOME
  ======================================================= */

  if (
    /^EV\d*$/.test(code) ||
    code === "EV" ||
    name.includes("vistadome")
  ) {
    return "EV";
  }

  /* =======================================================
     SECOND SITTING
  ======================================================= */

  if (
    /^D\d+$/.test(code) ||
    code === "D" ||
    code === "2S" ||
    name.includes("second sitting") ||
    name.includes("second seating")
  ) {
    return "2S";
  }

  /* =======================================================
     CHAIR CAR
  ======================================================= */

  if (
    /^C\d+$/.test(code) ||
    code === "C" ||
    code === "CC" ||
    type.includes("CC") ||
    name.includes("chair car")
  ) {
    return "CC";
  }

  /* =======================================================
     PANTRY
  ======================================================= */

  if (
    code === "PC" ||
    name.includes("pantry") ||
    name.includes("buffet")
  ) {
    return "PANTRY";
  }

  /* =======================================================
     PARCEL
  ======================================================= */

  if (
    code === "VP" ||
    code === "VPH" ||
    name.includes("parcel")
  ) {
    return "PARCEL";
  }

  /* =======================================================
     RMS
  ======================================================= */

  if (
    code === "RMS" ||
    name.includes("mail service")
  ) {
    return "RMS";
  }

  /* =======================================================
     UTILITY
  ======================================================= */

  if (
    code === "PWR" ||
    code === "HCP" ||
    code === "SLR" ||
    code === "LRD" ||
    code === "DL" ||
    code === "EOG" ||
    code === "HOG" ||
    code === "ENG" ||
    name.includes("luggage") ||
    name.includes("brake") ||
    name.includes("generator") ||
    name.includes("engine")
  ) {
    return "UTILITY";
  }

  return "UNKNOWN";
}

/* =========================================================
   SEAT
========================================================= */

interface Seat {
  number: number;
  label: string;
  type: string;
}

function seat(
  number: number,
  type: string,
  label?: string
): Seat {
  return {
    number,
    type,
    label: label || type,
  };
}

/* =========================================================
   SEAT STYLE
   Each berth/seat kind gets its own distinct, consistent
   color so the layout is easy to scan at a glance. Every
   seat of the SAME kind always looks identical.
========================================================= */

function seatStyle(type: string) {
  switch (type) {
    case "LB":
      return "bg-sky-50 border-sky-300 text-sky-700";

    case "MB":
      return "bg-indigo-50 border-indigo-300 text-indigo-700";

    case "UB":
      return "bg-violet-50 border-violet-300 text-violet-700";

    case "SL":
      return "bg-emerald-50 border-emerald-300 text-emerald-700";

    case "SU":
      return "bg-teal-50 border-teal-300 text-teal-700";

    case "W":
      return "bg-orange-50 border-orange-300 text-orange-700";

    case "A":
      return "bg-purple-50 border-purple-300 text-purple-700";

    case "M":
      return "bg-slate-100 border-slate-300 text-slate-700";

    case "WS":
      return "bg-orange-50 border-orange-300 text-orange-700";

    case "MS":
      return "bg-amber-50 border-amber-300 text-amber-700";

    case "AS":
      return "bg-yellow-50 border-yellow-300 text-yellow-700";

    default:
      return "bg-slate-50 border-slate-200 text-slate-600";
  }
}

/* =========================================================
   SEAT COMPONENT
========================================================= */

function SeatBox({
  seatData,
}: {
  seatData: Seat;
}) {
  return (
    <div
      className={`
        ${seatStyle(seatData.type)}
        flex
        h-12
        min-w-0
        items-center
        justify-center
        rounded-lg
        border
        transition-all
        duration-150
        hover:-translate-y-0.5
        hover:shadow-md
      `}
    >
      <div className="text-center">
        <strong className="block text-sm font-black leading-none">
          {seatData.number}
        </strong>

        <span className="mt-1 block text-[7px] font-bold uppercase tracking-wide opacity-70">
          {seatData.label}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   GULLY
========================================================= */

function Gully({
  label = "GULLY",
}: {
  label?: string;
}) {
  return (
    <div className="relative flex min-h-full w-12 items-stretch justify-center">
      <div className="w-px border-l border-dashed border-slate-300" />

      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-white px-1 text-[6px] font-black tracking-widest text-slate-300">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   COACH FRAME
========================================================= */

function CoachFrame({
  children,
  layout,
  coach,
}: {
  children: React.ReactNode;
  layout: CoachLayoutType;
  coach: Coach;
}) {
  const icon =
    layout === "AC1" ? (
      <Crown size={22} />
    ) : layout === "CC" ||
      layout === "EC" ||
      layout === "EA" ||
      layout === "EV" ? (
      <Armchair size={22} />
    ) : (
      <BedDouble size={22} />
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800">
              {coach.code || "Coach"}
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {coach.name || "Coach"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <strong className="text-2xl font-black leading-none text-slate-800">
            {coach.position || "—"}
          </strong>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Position
          </span>
        </div>
      </div>

      {/* BODY */}

      <div className="bg-slate-50/70 px-4 py-7 sm:px-6">
        <div className="mx-auto mb-4 flex max-w-3xl items-center justify-center gap-2 text-[8px] font-black tracking-widest text-slate-400">
          <TrainFront size={14} />
          FRONT / ENGINE SIDE
        </div>

        <div className="mx-auto max-w-3xl rounded-[26px] border-2 border-slate-300 bg-white p-3 shadow-lg sm:p-4">
          <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
              Coach
            </span>

            <strong className="text-sm font-black text-slate-800">
              {coach.code}
            </strong>

            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
              {layout}
            </span>
          </div>

          {children}

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400">
              <DoorOpen size={13} />
              ENTRY
            </div>

            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400">
              EXIT
              <DoorOpen size={13} />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-3xl items-center justify-center gap-2 text-[8px] font-black tracking-widest text-slate-400">
          REAR
          <TrainFront size={14} className="rotate-180" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AC 2 TIER
   54 BERTHS (9 BAYS x 6)

   1  2       5
   3  4       6

   7  8       11
   9 10       12

   ...

   49 50      53
   51 52      54
========================================================= */

function AC2Layout() {
  const rows = [];

  for (let base = 1; base <= 49; base += 6) {
    rows.push([
      [seat(base, "LB"), seat(base + 1, "UB")],
      [seat(base + 2, "LB"), seat(base + 3, "UB")],
      [seat(base + 4, "SL")],
      [seat(base + 5, "SU")],
    ]);
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index}>
          <div className="grid grid-cols-[1fr_48px_0.48fr] items-stretch gap-2">
            <div className="grid grid-cols-2 gap-1.5">
              {row[0].map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}

              {row[1].map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}
            </div>

            <Gully />

            <div className="grid grid-cols-1 gap-1.5">
              {row[2].map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}

              {row[3].map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}
            </div>
          </div>

          {index !== rows.length - 1 && (
            <div className="mt-3 h-px bg-slate-100" />
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   AC 3 TIER / SLEEPER / AC 3 ECONOMY
   EXACT 3 + GULLY + SIDE STRUCTURE

   Configured capacities:
   - AC 3 Tier (3A):        72 berths (9 bays x 8)
   - Sleeper (SL):          80 berths (10 bays x 8)
   - AC 3 Economy / GR 3A:  83 berths (10 bays x 8 + 3 extra)
========================================================= */

function ThreeTierLayout({
  total,
}: {
  total: number;
}) {
  const rows = [];

  for (let base = 1; base <= total - 7; base += 8) {
    rows.push({
      first: [
        seat(base, "LB"),
        seat(base + 1, "MB"),
        seat(base + 2, "UB"),
      ],
      second: [
        seat(base + 3, "LB"),
        seat(base + 4, "MB"),
        seat(base + 5, "UB"),
      ],
      side: [
        seat(base + 6, "SL"),
        seat(base + 7, "SU"),
      ],
    });
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index}>
          <div className="grid grid-cols-[1fr_48px_0.34fr] items-stretch gap-2">
            <div className="grid grid-cols-3 gap-1.5">
              {row.first.map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}

              {row.second.map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}
            </div>

            <Gully />

            <div className="grid grid-cols-1 gap-1.5">
              {row.side.map((s) => (
                <SeatBox key={s.number} seatData={s} />
              ))}
            </div>
          </div>

          {index !== rows.length - 1 && (
            <div className="mt-3 h-px bg-slate-100" />
          )}
        </div>
      ))}

      {/* Remaining 3 seats for AC 3 Economy (83 total) */}

      {total === 83 && (
        <div className="grid grid-cols-[1fr_48px_0.34fr] gap-2 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-3 gap-1.5">
            <SeatBox seatData={seat(81, "LB")} />
            <SeatBox seatData={seat(82, "MB")} />
            <SeatBox seatData={seat(83, "UB")} />
          </div>

          <Gully />

          <div />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FIRST AC
   REAL COACH: 24 BERTHS
   (alternating 4-berth cabins and 2-berth coupes)
========================================================= */

function FirstACLayout() {
  // FIX: previous cabin list summed to 26 berths.
  // A real First AC (H1) coach has 24 berths.
  const cabins = [
    [1, 2, 3, 4],
    [5, 6],
    [7, 8, 9, 10],
    [11, 12],
    [13, 14, 15, 16],
    [17, 18],
    [19, 20, 21, 22],
    [23, 24],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {cabins.map((cabin, index) => (
        <div
          key={index}
          className="grid min-h-[92px] grid-cols-[1fr_1fr] border-b border-slate-200 last:border-b-0"
        >
          <div className="grid grid-cols-2 gap-1.5 p-3">
            {cabin.map((number) => (
              <SeatBox
                key={number}
                seatData={seat(
                  number,
                  number % 2 === 0 ? "UB" : "LB",
                  number % 2 === 0 ? "UB" : "LB"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-center border-l border-slate-200 bg-slate-50">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              CABIN-{String.fromCharCode(65 + index)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   SECOND SITTING
   106 SEATS TOTAL (as generated by this layout)
========================================================= */

function SecondSittingLayout() {
  const rows = [];

  const seatGroups = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
  ];

  let number = 12;

  for (let i = 0; i < 14; i++) {
    const left = [number, number + 1, number + 2];

    const right = [number + 3, number + 4, number + 5];

    rows.push({ left, right });

    number += 6;
  }

  return (
    <div className="space-y-2">
      {/* FIRST ROWS */}

      {seatGroups.map((group, index) => (
        <div
          key={`initial-${index}`}
          className="grid grid-cols-[1fr_48px_1fr] items-center gap-2"
        >
          <div className="grid grid-cols-3 gap-1.5">
            {group
              .slice(0, index === 0 ? 2 : 3)
              .map((n) => (
                <SeatBox
                  key={n}
                  seatData={seat(
                    n,
                    n === 1 || n === 5 || n === 6 || n === 11
                      ? "WS"
                      : n === 3 || n === 8 || n === 9
                        ? "AS"
                        : "MS"
                  )}
                />
              ))}
          </div>

          <Gully label="AISLE" />

          <div className="grid grid-cols-3 gap-1.5">
            {group
              .slice(index === 0 ? 2 : 3)
              .map((n) => (
                <SeatBox
                  key={n}
                  seatData={seat(
                    n,
                    n === 5 || n === 6 || n === 11
                      ? "WS"
                      : n === 3 || n === 8 || n === 9
                        ? "AS"
                        : "MS"
                  )}
                />
              ))}
          </div>
        </div>
      ))}

      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_48px_1fr] items-center gap-2"
        >
          <div className="grid grid-cols-3 gap-1.5">
            {row.left.map((n) => (
              <SeatBox
                key={n}
                seatData={seat(
                  n,
                  n % 3 === 0 ? "WS" : n % 3 === 1 ? "MS" : "AS"
                )}
              />
            ))}
          </div>

          <Gully label="AISLE" />

          <div className="grid grid-cols-3 gap-1.5">
            {row.right.map((n) => (
              <SeatBox
                key={n}
                seatData={seat(
                  n,
                  n % 3 === 0 ? "AS" : n % 3 === 1 ? "MS" : "WS"
                )}
              />
            ))}
          </div>
        </div>
      ))}

      {/* FINAL ROWS */}

      <div className="grid grid-cols-[1fr_48px_1fr] gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[96, 97, 98].map((n) => (
            <SeatBox
              key={n}
              seatData={seat(
                n,
                n % 3 === 0 ? "WS" : n % 3 === 1 ? "MS" : "AS"
              )}
            />
          ))}
        </div>

        <Gully label="AISLE" />

        <div className="grid grid-cols-3 gap-1.5">
          {[99, 100, 101].map((n) => (
            <SeatBox
              key={n}
              seatData={seat(
                n,
                n % 3 === 0 ? "AS" : n % 3 === 1 ? "MS" : "WS"
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_48px_1fr] gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[102, 103, 104].map((n) => (
            <SeatBox
              key={n}
              seatData={seat(
                n,
                n === 102 ? "WS" : "AS",
                n === 103 ? "MS" : "AS"
              )}
            />
          ))}
        </div>

        <Gully label="AISLE" />

        <div className="grid grid-cols-2 gap-1.5">
          {[105, 106].map((n) => (
            <SeatBox key={n} seatData={seat(n, n === 106 ? "WS" : "AS")} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EXECUTIVE CHAIR CAR / ANUBHUTI / VISTADOME (EXEC)
   2 + GULLY + 2

   Real capacities:
   - Executive Chair Car (EC): 56 seats
   - Anubhuti (EA):            52 seats
   - Vistadome Executive (EV): 44 seats
========================================================= */

function FourAcrossLayout({
  total,
}: {
  total: number;
}) {
  const rows = [];

  for (let base = 1; base <= total; base += 4) {
    rows.push([
      seat(base, "W", "W"),
      seat(base + 1, "A", "A"),
      seat(base + 2, "A", "A"),
      seat(base + 3, "W", "W"),
    ]);
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_48px_1fr] items-center gap-2"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {row.slice(0, 2).map((s) => (
              <SeatBox key={s.number} seatData={s} />
            ))}
          </div>

          <Gully label="AISLE" />

          <div className="grid grid-cols-2 gap-1.5">
            {row.slice(2).map((s) => (
              <SeatBox key={s.number} seatData={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   CHAIR CAR
   REAL COACH: 78 SEATS
   (3 + gully + 2 pattern, capped by 2 short end rows)
========================================================= */

function ChairCarLayout() {
  const rows = [
    {
      left: [seat(1, "W"), seat(2, "A")],
      right: [seat(3, "A"), seat(4, "W")],
    },
  ];

  for (let base = 5; base <= 74; base += 5) {
    rows.push({
      left: [
        seat(base, "W"),
        seat(base + 1, "M"),
        seat(base + 2, "A"),
      ],
      right: [seat(base + 3, "A"), seat(base + 4, "W")],
    });
  }

  rows.push({
    left: [seat(75, "W"), seat(76, "A")],
    right: [seat(77, "A"), seat(78, "W")],
  });

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_64px_1fr] items-stretch gap-2"
        >
          {/* LEFT */}

          <div
            className={`grid gap-1.5 ${
              row.left.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {row.left.map((s) => (
              <SeatBox key={s.number} seatData={s} />
            ))}
          </div>

          {/* GULLY */}

          <div className="flex min-h-full flex-col items-center justify-center">
            {index === 0 && (
              <span className="mb-1 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                GULLY
              </span>
            )}

            <div className="flex-1 w-full border-x border-dashed border-slate-200 bg-slate-50/40" />
          </div>

          {/* RIGHT */}

          <div
            className={`grid gap-1.5 ${
              row.right.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {row.right.map((s) => (
              <SeatBox key={s.number} seatData={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   VISTADOME
========================================================= */

function VistadomeLayout() {
  return <FourAcrossLayout total={44} />;
}

/* =========================================================
   NON-SEAT COACH
========================================================= */

function getCoachIcon(layout: CoachLayoutType) {
  if (
    layout === "UTILITY" ||
    layout === "PANTRY" ||
    layout === "PARCEL" ||
    layout === "RMS"
  ) {
    return <Luggage size={25} />;
  }

  if (layout === "GENERAL") {
    return <Users size={25} />;
  }

  return <Luggage size={25} />;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CoachesLayout({
  coach,
}: CoachesLayoutProps) {
  const layout = detectCoachType(coach);

  /* =======================================================
     NON-SEAT COACHES
  ======================================================= */

  if (
    layout === "GENERAL" ||
    layout === "UTILITY" ||
    layout === "PANTRY" ||
    layout === "PARCEL" ||
    layout === "RMS" ||
    layout === "UNKNOWN"
  ) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          {getCoachIcon(layout)}
        </div>

        <h2 className="text-3xl font-black text-slate-800">
          {coach.code || "Coach"}
        </h2>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          {coach.name || "Coach"}
        </p>

        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-500">
            This coach does not have a passenger berth layout.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     AC 2
  ======================================================= */

  if (layout === "AC2") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <AC2Layout />
      </CoachFrame>
    );
  }

  /* =======================================================
     AC 3
  ======================================================= */

  if (layout === "AC3") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <ThreeTierLayout total={72} />
      </CoachFrame>
    );
  }

  /* =======================================================
     SLEEPER
  ======================================================= */

  if (layout === "SLEEPER") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <ThreeTierLayout total={80} />
      </CoachFrame>
    );
  }

  /* =======================================================
     AC 3 ECONOMY
     GARIB RATH 3A ALSO COMES HERE
  ======================================================= */

  if (layout === "AC3E") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <ThreeTierLayout total={83} />
      </CoachFrame>
    );
  }

  /* =======================================================
     FIRST AC
  ======================================================= */

  if (layout === "AC1") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <FirstACLayout />
      </CoachFrame>
    );
  }

  /* =======================================================
     SECOND SITTING
  ======================================================= */

  if (layout === "2S") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <SecondSittingLayout />
      </CoachFrame>
    );
  }

  /* =======================================================
     EXECUTIVE CHAIR
  ======================================================= */

  if (layout === "EC") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <FourAcrossLayout total={56} />
      </CoachFrame>
    );
  }

  /* =======================================================
     ANUBHUTI
  ======================================================= */

  if (layout === "EA") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <FourAcrossLayout total={52} />
      </CoachFrame>
    );
  }

  /* =======================================================
     VISTADOME
  ======================================================= */

  if (layout === "EV") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <VistadomeLayout />
      </CoachFrame>
    );
  }

  /* =======================================================
     CHAIR CAR
  ======================================================= */

  if (layout === "CC") {
    return (
      <CoachFrame layout={layout} coach={coach}>
        <ChairCarLayout />
      </CoachFrame>
    );
  }

  /* =======================================================
     FALLBACK
  ======================================================= */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h2 className="text-2xl font-black text-slate-800">
        {coach.code || "Coach"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Layout is not available for this coach.
      </p>
    </div>
  );
}