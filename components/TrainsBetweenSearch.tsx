"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRightLeft,
  MapPin,
  Route,
  Search,
  X,
} from "lucide-react";

import {
  searchStations,
  StationSuggestion,
} from "../lib/api";

interface Props {
  initialFrom: StationSuggestion;
  initialTo: StationSuggestion;
}

function RailwayStationField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: StationSuggestion | null;
  onChange: (value: StationSuggestion | null) => void;
  placeholder: string;
}) {
  const [text, setText] = useState(
    value ? `${value.name} (${value.code})` : ""
  );

  const [suggestions, setSuggestions] =
    useState<StationSuggestion[]>([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {
    setText(
      value
        ? `${value.name} (${value.code})`
        : ""
    );
  }, [value]);


  useEffect(() => {

    if (value) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const query = text.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(
      async () => {

        setLoading(true);

        try {

          const result =
            await searchStations(query);

          const list =
            Array.isArray(result)
              ? result
              : [];

          setSuggestions(list);
          setOpen(list.length > 0);

        } catch {

          setSuggestions([]);
          setOpen(false);

        } finally {

          setLoading(false);

        }

      },
      300
    );

    return () => {
      clearTimeout(timer);
    };

  }, [text, value]);


  function selectStation(
    station: StationSuggestion
  ) {

    setText(
      `${station.name} (${station.code})`
    );

    onChange(station);

    setSuggestions([]);
    setOpen(false);
  }


  function clear() {

    setText("");

    setSuggestions([]);
    setOpen(false);

    onChange(null);
  }


  return (
    <div className="bw-field">

      <label>
        {label}
      </label>

      <div className="bw-field-box">

        <MapPin
          size={19}
          className="bw-field-icon"
        />

        <input
          value={text}
          placeholder={placeholder}
          autoComplete="off"

          onChange={(event) => {

            const next =
              event.target.value;

            setText(next);

            if (value) {
              onChange(null);
            }

          }}

          onFocus={() => {

            if (suggestions.length) {
              setOpen(true);
            }

          }}
        />

        {text && (
          <button
            type="button"
            className="bw-clear"
            onClick={clear}
          >
            <X size={16} />
          </button>
        )}

        {loading ? (
          <span className="bw-field-spinner" />
        ) : (
          <Search
            size={18}
            className="bw-field-search"
          />
        )}

      </div>


      {open &&
        suggestions.length > 0 && (

          <div className="bw-suggestions">

            {suggestions.map(
              (station) => (

                <button
                  type="button"
                  key={station.code}

                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}

                  onClick={() =>
                    selectStation(station)
                  }
                >

                  <MapPin size={16} />

                  <span>
                    <strong>
                      {station.name}
                    </strong>

                    <small>
                      {station.code}
                    </small>
                  </span>

                </button>

              )
            )}

          </div>
        )}

    </div>
  );
}


export default function TrainsBetweenSearch({
  initialFrom,
  initialTo,
}: Props) {

  const router = useRouter();

  const [fromStation, setFromStation] =
    useState<StationSuggestion | null>(
      initialFrom
    );

  const [toStation, setToStation] =
    useState<StationSuggestion | null>(
      initialTo
    );

  const [error, setError] =
    useState("");


  function swapStations() {

    const oldFrom = fromStation;

    setFromStation(toStation);
    setToStation(oldFrom);

    setError("");
  }


  function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");


    if (!fromStation) {

      setError(
        "Please select the From station."
      );

      return;
    }


    if (!toStation) {

      setError(
        "Please select the To station."
      );

      return;
    }


    if (
      fromStation.code.toUpperCase() ===
      toStation.code.toUpperCase()
    ) {

      setError(
        "From and To stations cannot be the same."
      );

      return;
    }


    router.push(
      `/trains-between/${encodeURIComponent(
        fromStation.code
      )}/${encodeURIComponent(
        toStation.code
      )}`
    );
  }


  return (
    <>

      <div className="bw-search-box">

        <div className="bw-search-label">

          <Route size={16} />

          Trains Between Stations

        </div>


        <form
          className="bw-form"
          onSubmit={submit}
        >

          <RailwayStationField
            label="From"
            value={fromStation}
            onChange={setFromStation}
            placeholder="Station name or code"
          />


          <button
            type="button"
            className="bw-swap"
            onClick={swapStations}
            title="Swap stations"
          >
            <ArrowRightLeft
              size={19}
            />
          </button>


          <RailwayStationField
            label="To"
            value={toStation}
            onChange={setToStation}
            placeholder="Station name or code"
          />


          <button
            type="submit"
            className="bw-submit"
          >

            <Search size={19} />

            Search Trains

          </button>

        </form>


        {error && (
          <div className="bw-search-error">
            {error}
          </div>
        )}

      </div>


      <style jsx global>{`

        .bw-search-box {
          position: relative;

          width: 100%;

          margin-top: 18px;

          padding: 11px;

          border: 1px solid #dce5f0;
          border-radius: 16px;

          background: #ffffff;

          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, 0.07);

          text-align: left;
        }


        .bw-search-label {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding: 8px 12px;

          border-radius: 8px;

          background: #2554d9;

          color: white;

          font-size: 11px;
          font-weight: 800;
        }


        .bw-form {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            44px
            minmax(0, 1fr)
            170px;

          gap: 10px;

          align-items: end;

          margin-top: 10px;
        }


        .bw-field {
          position: relative;

          min-width: 0;
        }


        .bw-field > label {
          display: block;

          margin: 0 0 5px 12px;

          color: #94a3b8;

          font-size: 10px;
          font-weight: 800;

          text-transform: uppercase;
        }


        .bw-field-box {
          display: flex;

          align-items: center;

          gap: 8px;

          width: 100%;
          height: 54px;

          padding: 0 13px;

          border: 1px solid #dbe4ef;

          border-radius: 11px;

          background: white;
        }


        .bw-field-box:focus-within {
          border-color: #2554d9;

          box-shadow:
            0 0 0 3px
            rgba(37, 84, 217, 0.08);
        }


        .bw-field-icon {
          flex-shrink: 0;

          color: #2554d9;
        }


        .bw-field-box input {
          width: 100%;
          min-width: 0;
          height: 100%;

          padding: 0;

          border: 0;
          outline: 0;

          background: transparent;

          color: #172033;

          font-family: inherit;

          font-size: 15px;
          font-weight: 700;
        }


        .bw-field-box input::placeholder {
          color: #94a3b8;

          font-weight: 500;
        }


        .bw-clear {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 28px;
          height: 28px;

          flex-shrink: 0;

          padding: 0;

          border: 0;
          border-radius: 7px;

          background: #f1f5f9;

          color: #64748b;

          cursor: pointer;
        }


        .bw-field-search {
          flex-shrink: 0;

          color: #2250d8;
        }


        .bw-field-spinner {
          width: 17px;
          height: 17px;

          flex-shrink: 0;

          border: 2px solid #dbeafe;

          border-top-color: #2250d8;

          border-radius: 50%;

          animation:
            bw-field-spin
            0.7s linear infinite;
        }


        .bw-suggestions {
          position: absolute;

          z-index: 100;

          top: calc(100% + 6px);

          left: 0;
          right: 0;

          overflow: hidden;

          border: 1px solid #dbe4ef;

          border-radius: 10px;

          background: white;

          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, 0.14);
        }


        .bw-suggestions button {
          display: flex;

          align-items: center;

          gap: 10px;

          width: 100%;

          padding: 11px 13px;

          border: 0;
          border-bottom: 1px solid #f1f5f9;

          background: white;

          color: #2250d8;

          text-align: left;

          cursor: pointer;
        }


        .bw-suggestions button:hover {
          background: #f8fafc;
        }


        .bw-suggestions button span {
          display: flex;

          flex-direction: column;

          min-width: 0;
        }


        .bw-suggestions strong {
          color: #172033;

          font-size: 13px;
        }


        .bw-suggestions small {
          margin-top: 2px;

          color: #94a3b8;

          font-size: 10px;
          font-weight: 700;
        }


        .bw-swap {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 44px;
          height: 44px;

          margin-bottom: 5px;

          padding: 0;

          border: 1px solid #dbe4ef;

          border-radius: 10px;

          background: white;

          color: #2250d8;

          cursor: pointer;
        }


        .bw-swap:hover {
          background: #eff6ff;

          border-color: #bfd3ff;
        }


        .bw-submit {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          height: 54px;

          padding: 0 18px;

          border: 0;

          border-radius: 11px;

          background: #2554d9;

          color: white;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;

          white-space: nowrap;
        }


        .bw-submit:hover {
          background: #1d46be;
        }


        .bw-search-error {
          margin: 7px 3px 0;

          color: #dc2626;

          font-size: 11px;
          font-weight: 600;
        }


        @keyframes bw-field-spin {
          to {
            transform: rotate(360deg);
          }
        }


        @media (max-width: 900px) {

          .bw-form {
            grid-template-columns: 1fr;
          }

          .bw-swap {
            margin: 0 auto;
          }

        }


        @media (max-width: 600px) {

          .bw-search-box {
            padding: 9px;
          }

          .bw-field-box {
            height: 50px;
          }

          .bw-submit {
            width: 100%;
            height: 50px;
          }

        }

      `}</style>

    </>
  );
}