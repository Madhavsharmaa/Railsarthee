export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:5000"
).replace(/\/$/, "");

export type StationSuggestion = {
  name: string;
  code: string;
};

export type TrainSuggestion = {
  train_number: string;
  train_name?: string | null;
  eng_train_name?: string | null;

  source?: {
    code?: string | null;
    name?: string | null;
  };

  destination?: {
    code?: string | null;
    name?: string | null;
  };
};

/* -------------------------------------------------------------------------- */
/* Generic JSON request                                                       */
/* -------------------------------------------------------------------------- */

async function request<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await r.json().catch(() => null);

  if (!r.ok) {
    throw new Error(
      data?.error || `Request failed (${r.status})`
    );
  }

  return data as T;
}

/* -------------------------------------------------------------------------- */
/* Stations                                                                   */
/* -------------------------------------------------------------------------- */

export const searchStations = (q: string) =>
  request<StationSuggestion[]>(
    `/api/stations/search?q=${encodeURIComponent(q)}`
  );

/* -------------------------------------------------------------------------- */
/* Trains                                                                     */
/* -------------------------------------------------------------------------- */

export const searchTrains = (q: string) =>
  request<TrainSuggestion[]>(
    `/api/trains/search?q=${encodeURIComponent(q)}`
  );

export const trainsBetween = (a: string, b: string) =>
  request<unknown>(
    `/api/trains-between/${encodeURIComponent(a)}/${encodeURIComponent(b)}`
  );

/* -------------------------------------------------------------------------- */
/* Live Status                                                                 */
/* -------------------------------------------------------------------------- */

export async function liveStatus(
  trainNumber: string,
  day: "today" | "yesterday" | "tomorrow"
) {
  const url =
    `${API_BASE}/api/live-status/` +
    `${encodeURIComponent(trainNumber)}/` +
    `${encodeURIComponent(day)}`;

  console.log("[LIVE STATUS] GET:", url);

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Live status API failed (${response.status}): ${text.slice(
        0,
        200
      )}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Live status backend did not return JSON."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Timetable                                                                   */
/* -------------------------------------------------------------------------- */

export const timetable = (n: string) =>
  request<unknown>(
    `/api/timetable/${encodeURIComponent(n)}`
  );

/* -------------------------------------------------------------------------- */
/* Coach Position                                                              */
/* -------------------------------------------------------------------------- */

export const coachPosition = (n: string) =>
  request<unknown>(
    `/api/coach-position/${encodeURIComponent(n)}`
  );

/* -------------------------------------------------------------------------- */
/* Railway Announcement - Text                                                */
/* -------------------------------------------------------------------------- */

export const announcement = (n: string, l: string) =>
  request<any>(
    `/api/announcement/${encodeURIComponent(n)}/${encodeURIComponent(
      l.toLowerCase()
    )}`
  );

/* -------------------------------------------------------------------------- */
/* Railway Announcement - Server-side TTS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Generates announcement audio on the Flask server using gTTS.
 *
 * The backend returns:
 *     Content-Type: audio/mpeg
 *
 * Nothing is saved on the client.
 */
export const announcementAudio = async (
  n: string,
  l: string,
  platform = "1"
): Promise<Blob> => {
  const url =
    `${API_BASE}/api/announcement/audio/` +
    `${encodeURIComponent(n)}/` +
    `${encodeURIComponent(l.toLowerCase())}` +
    `?platform=${encodeURIComponent(platform)}`;

  console.log("[ANNOUNCEMENT AUDIO] POST:", url);

  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "audio/mpeg",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");

    throw new Error(
      text
        ? `TTS API failed (${response.status}): ${text.slice(
            0,
            200
          )}`
        : `TTS API failed (${response.status})`
    );
  }

  return await response.blob();
};