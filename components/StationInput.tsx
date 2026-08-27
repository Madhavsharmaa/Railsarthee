"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";

import {
  searchStations,
  StationSuggestion,
} from "../lib/api";

interface StationInputProps {
  label: string;
  value: StationSuggestion | null;
  onChange: (value: StationSuggestion | null) => void;
  placeholder: string;
}

export default function StationInput({
  label,
  value,
  onChange,
  placeholder,
}: StationInputProps) {
  const [text, setText] = useState(
    value ? `${value.name} (${value.code})` : ""
  );

  const [items, setItems] = useState<StationSuggestion[]>(
    []
  );

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  /*
   * Keep text synchronized with selected station
   */
  useEffect(() => {
    setText(
      value ? `${value.name} (${value.code})` : ""
    );
  }, [value]);

  /*
   * Search stations
   */
  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    /*
     * Don't search when a station is already selected.
     */
    if (text.trim().length < 3 || value) {
      setItems([]);
      setOpen(false);
      return;
    }

    timer.current = setTimeout(async () => {
      setLoading(true);

      try {
        const results = await searchStations(
          text.trim()
        );

        setItems(
          Array.isArray(results)
            ? results
            : []
        );

        setOpen(
          Array.isArray(results) &&
            results.length > 0
        );
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [text, value]);

  /*
   * Select station
   */
  function selectStation(
    station: StationSuggestion
  ) {
    onChange(station);

    setText(
      `${station.name} (${station.code})`
    );

    setOpen(false);
  }

  /*
   * Clear input
   */
  function clearInput() {
    setText("");

    setItems([]);

    setOpen(false);

    onChange(null);
  }

  return (
    <div className="autocomplete">
      <label>{label}</label>

      <div className="input-shell">
        <MapPin size={17} />

        <input
          value={text}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            const nextValue = e.target.value;

            setText(nextValue);

            /*
             * Once the user starts typing again,
             * the previously selected station is invalid.
             */
            if (value) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (items.length > 0) {
              setOpen(true);
            }
          }}
        />

        {text && (
          <button
            type="button"
            className="input-clear"
            onClick={clearInput}
            aria-label={`Clear ${label} station`}
          >
            <X size={15} />
          </button>
        )}

        {loading ? (
          <span className="spinner" />
        ) : (
          <Search size={16} />
        )}
      </div>

      {open && items.length > 0 && (
        <div className="suggestions">
          {items.map((station) => (
            <button
              type="button"
              key={`${station.code}-${station.name}`}
              onClick={() =>
                selectStation(station)
              }
            >
              <span className="suggestion-icon">
                <MapPin size={15} />
              </span>

              <span className="suggestion-content">
                <strong>
                  {station.name}
                </strong>

                <small>
                  {station.code}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}