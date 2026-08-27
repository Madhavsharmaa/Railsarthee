"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  Search,
  TrainFront,
} from "lucide-react";

import StationInput from "./StationInput";
import TrainInput from "./TrainInput";

import {
  StationSuggestion,
  TrainSuggestion,
} from "../lib/api";

export default function HomeSearch() {
  const router = useRouter();

  const [mode, setMode] =
    useState<"route" | "train">("route");

  const [from, setFrom] =
    useState<StationSuggestion | null>(null);

  const [to, setTo] =
    useState<StationSuggestion | null>(null);

  const [train, setTrain] =
    useState<TrainSuggestion | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==========================================================
     FORM SUBMIT
  ========================================================== */

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* ========================================================
       SEARCH A TRAIN
    ======================================================== */

    if (mode === "train") {
      if (!train?.train_number) {
        setError(
          "Select a train from the suggestions."
        );
        return;
      }

      /*
       * IMPORTANT:
       *
       * Store ONLY the train number.
       *
       * Do NOT store the complete train object.
       *
       * This prevents live-status input from becoming:
       *
       * {"train_number":"12055","train_name":"..."}
       *
       * Instead it receives:
       *
       * 12055
       */

      sessionStorage.setItem(
        "selectedLiveTrain",
        String(train.train_number)
      );

      /*
       * Clean URL.
       *
       * No query parameter.
       * No dynamic route.
       */

      router.push("/live-status");

      return;
    }

    /* ========================================================
       TRAINS BETWEEN STATIONS
    ======================================================== */

    if (!from || !to) {
      setError(
        "Select both stations from the suggestions."
      );
      return;
    }

    if (from.code === to.code) {
      setError(
        "From and To stations cannot be the same."
      );
      return;
    }

    setLoading(true);

    router.push(
      `/trains-between/${encodeURIComponent(
        from.code
      )}/${encodeURIComponent(to.code)}`
    );
  }

  /* ==========================================================
     SWAP STATIONS
  ========================================================== */

  function swapStations() {
    const currentFrom = from;

    setFrom(to);
    setTo(currentFrom);
    setError("");
  }

  /* ==========================================================
     CHANGE SEARCH MODE
  ========================================================== */

  function changeMode(
    newMode: "route" | "train"
  ) {
    setMode(newMode);
    setError("");
    setLoading(false);

    if (newMode === "route") {
      setTrain(null);
    }

    if (newMode === "train") {
      setFrom(null);
      setTo(null);
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section className="search-panel">

      {/* ====================================================
          SEARCH TABS
      ==================================================== */}

      <div className="search-tabs">

        <button
          type="button"
          className={
            mode === "route"
              ? "active"
              : ""
          }
          onClick={() =>
            changeMode("route")
          }
        >
          <TrainFront size={17} />

          Trains Between Stations
        </button>

        <button
          type="button"
          className={
            mode === "train"
              ? "active"
              : ""
          }
          onClick={() =>
            changeMode("train")
          }
        >
          <Search size={17} />

          Search a Train
        </button>

      </div>

      {/* ====================================================
          FORM
      ==================================================== */}

      <form onSubmit={submit}>

        {mode === "route" ? (

          <div className="route-fields">

            {/* FROM */}

            <StationInput
              label="From"
              value={from}
              onChange={(station) => {
                setFrom(station);
                setError("");
              }}
              placeholder="Station name or code"
            />

            {/* SWAP */}

            <button
              type="button"
              className="swap-btn"
              onClick={swapStations}
              title="Swap stations"
            >
              <ArrowRightLeft
                size={17}
              />
            </button>

            {/* TO */}

            <StationInput
              label="To"
              value={to}
              onChange={(station) => {
                setTo(station);
                setError("");
              }}
              placeholder="Station name or code"
            />

          </div>

        ) : (

          <TrainInput
            value={train}
            onChange={(selectedTrain) => {
              setTrain(selectedTrain);
              setError("");
            }}
          />

        )}

        {/* ==================================================
            SUBMIT
        =================================================== */}

        <button
          type="submit"
          className="primary-btn search-btn"
          disabled={loading}
        >
          <Search size={17} />

          {mode === "route"
            ? loading
              ? "Opening..."
              : "SEARCH TRAINS"
            : "SEARCH TRAIN"}
        </button>

      </form>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

    </section>
  );
}