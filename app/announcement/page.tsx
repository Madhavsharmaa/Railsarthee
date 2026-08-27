"use client";

import { useRef, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TrainInput from "../../components/TrainInput";
import {
  announcement,
  announcementAudio,
  TrainSuggestion,
} from "../../lib/api";

const languages = [
  "Hindi",
  "English",
  "Punjabi",
  "Bengali",
  "Gujarati",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Odia",
  "Assamese",
  "Urdu",
  "Nepali",
];

export default function Page() {
  const [train, setTrain] = useState<TrainSuggestion | null>(null);
  const [language, setLanguage] = useState("Hindi");

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const [showAnnouncementText, setShowAnnouncementText] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  function cleanupAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setSpeaking(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!train) {
      setError("Select a train from the suggestions.");
      return;
    }

    setError("");
    setData(null);
    setShowAnnouncementText(false);
    cleanupAudio();

    /*
     * IMPORTANT:
     *
     * Nothing is displayed after the form is submitted.
     *
     * 1. Generate announcement text.
     * 2. Generate/download the COMPLETE MP3.
     * 3. Create the Audio object.
     * 4. Wait until the browser can load the audio.
     * 5. Only THEN expose the Play button.
     */
    setLoading(true);

    try {
      // Generate the announcement first.
      const result = await announcement(
        train.train_number,
        language
      );

      if (!result?.announcement) {
        throw new Error("Backend did not return an announcement.");
      }

      // Generate and download the COMPLETE MP3.
      const audioBlob = await announcementAudio(
        train.train_number,
        language
      );

      if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
        throw new Error("The generated audio file is empty.");
      }

      // Create local URL only after the COMPLETE response has arrived.
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio();

      audio.preload = "auto";
      audio.src = audioUrl;

      audioRef.current = audio;

      // Wait until browser has loaded enough of the MP3 to play it.
      await new Promise<void>((resolve, reject) => {
        let resolved = false;

        const finish = () => {
          if (resolved) return;
          resolved = true;

          audio.removeEventListener("canplaythrough", finish);
          audio.removeEventListener("error", fail);

          resolve();
        };

        const fail = () => {
          if (resolved) return;
          resolved = true;

          audio.removeEventListener("canplaythrough", finish);
          audio.removeEventListener("error", fail);

          reject(new Error("Unable to load the generated audio."));
        };

        audio.addEventListener("canplaythrough", finish);
        audio.addEventListener("error", fail);

        audio.load();
      });

      /*
       * ONLY NOW do we expose the announcement UI.
       *
       * The user has not seen the text or Play button while
       * the backend was generating/downloading the MP3.
       */
      setData(result);
    } catch (err) {
      cleanupAudio();

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the announcement audio."
      );
    } finally {
      setLoading(false);
    }
  }

  async function playAnnouncement() {
    if (!audioRef.current) return;

    try {
      setSpeaking(true);

      await audioRef.current.play();
    } catch {
      setSpeaking(false);

      setError(
        "Unable to play the announcement. Please try again."
      );
    }
  }

  function stopAnnouncement() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setSpeaking(false);
  }

  return (
    <>
      <Header />

      <main className="tool-page">
        <section className="tool-hero">
          <div className="eyebrow">RAILSARTHI TOOL</div>

          <h1>Railway Announcement</h1>

          <p>
            Generate a multilingual announcement from timetable data
            stored in your database.
          </p>
        </section>

        <section className="tool-card">
          <form onSubmit={submit}>
            <TrainInput
              value={train}
              onChange={setTrain}
            />

            <label className="select-label">
              Language
            </label>

            <select
              className="language-select"
              value={language}
              disabled={loading}
              onChange={(e) => {
                setLanguage(e.target.value);

                setData(null);
                setShowAnnouncementText(false);
                setError("");

                cleanupAudio();
              }}
            >
              {languages.map((x) => (
                <option
                  key={x}
                  value={x}
                >
                  {x}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="primary-btn wide"
              disabled={loading}
            >
              {loading
                ? "GENERATING..."
                : "GENERATE ANNOUNCEMENT"}
            </button>
          </form>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* 
              IMPORTANT:
              While loading, NOTHING about the announcement is shown.
              Only this small waiting message appears.
          */}
          {loading && (
            <div className="audio-waiting">
              please wait while we generate audio
            </div>
          )}

          {/*
              This entire section appears ONLY after:
              - announcement JSON is received
              - complete MP3 is downloaded
              - browser has loaded the audio
          */}
          {!loading && data?.announcement && audioRef.current && (
            <div className="announcement-result">

              <div className="result-heading">
                <span>
                  {data.language || language}
                </span>

                <button
                  type="button"
                  className="toggle-text-btn"
                  onClick={() =>
                    setShowAnnouncementText(
                      (prev) => !prev
                    )
                  }
                  aria-label="Toggle announcement text"
                >
                  {showAnnouncementText ? "▲" : "▼"}
                </button>
              </div>

              {showAnnouncementText && (
                <p className="announcement-text">
                  {data.announcement}
                </p>
              )}

              <button
                type="button"
                onClick={
                  speaking
                    ? stopAnnouncement
                    : playAnnouncement
                }
                className="primary-btn wide"
              >
                {speaking
                  ? "STOP ANNOUNCEMENT"
                  : "▶ PLAY ANNOUNCEMENT"}
              </button>

            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}