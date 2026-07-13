import { Settings, Stats } from "../types";

const SETTINGS_KEY = "sedentary-reminder:settings";
const STATS_KEY = "sedentary-reminder:stats";

const systemLang = (typeof navigator !== "undefined" && navigator.language.startsWith("en")) ? "en" : "zh";

export const DEFAULT_SETTINGS: Settings = {
  exercise: { enabled: true, intervalMinutes: 60, forceMode: false },
  water: { enabled: true, intervalMinutes: 30, forceMode: false },
  soundEnabled: true,
  autoStart: true,
  muteInFullscreen: true,
  popupType: "fullscreen",
  breakSeconds: 300,
  theme: "dark",
  lang: systemLang,
};

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      exercise: { ...DEFAULT_SETTINGS.exercise, ...(parsed.exercise || {}) },
      water: { ...DEFAULT_SETTINGS.water, ...(parsed.water || {}) },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function loadStats(): Stats {
  const today = todayString();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { date: today, exercise: 0, water: 0 };
    const parsed = JSON.parse(raw) as Stats;
    if (parsed.date !== today) return { date: today, exercise: 0, water: 0 };
    return parsed;
  } catch {
    return { date: today, exercise: 0, water: 0 };
  }
}

export function saveStats(s: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}
