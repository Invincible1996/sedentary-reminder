import type { CSSProperties } from "react";
import { Language, ReminderType } from "../types";
import ExerciseIcon from "./icons/ExerciseIcon";
import WaterIcon from "./icons/WaterIcon";
import { I18N_TRANSLATIONS } from "../lib/i18n";

interface Props {
  type: ReminderType;
  remainingSeconds: number;
  progress: number; // 0..1
  running: boolean;
  fired: boolean;
  enabled: boolean;
  paused: boolean;
  lang: Language;
  onToggleEnabled: () => void;
  onSkip: () => void;
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function TimerCard({
  type,
  remainingSeconds,
  progress,
  running,
  fired,
  enabled,
  paused,
  lang,
  onToggleEnabled,
  onSkip,
}: Props) {
  const t = I18N_TRANSLATIONS[lang];
  const R = 52;
  const C = 2 * Math.PI * R;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = C * (1 - clamped);

  const status = !enabled
    ? t.statusDisabled
    : fired
      ? t.statusFired
      : paused
        ? t.statusPaused
        : running
          ? t.statusRunning
          : t.statusRunning;

  const label = type === "exercise" ? t.exerciseLabel : t.waterLabel;
  const timeDisplay = fired
    ? (lang === "zh" ? "该啦!" : "Now!")
    : formatTime(remainingSeconds);

  const style = {
    "--accent": type === "exercise" ? "var(--accent-exercise)" : "var(--accent-water)",
  } as CSSProperties;

  return (
    <div
      className={`timer-card${enabled ? "" : " disabled"}${fired ? " fired" : ""}`}
      style={style}
    >
      <div className="timer-card-top">
        <span className="timer-icon">
          {type === "exercise" ? (
            <ExerciseIcon className="card-svg-icon" />
          ) : (
            <WaterIcon className="card-svg-icon" />
          )}
        </span>
        <span className="timer-label">{label}</span>
        <label className="switch" title={enabled ? (lang === "zh" ? "停用" : "Disable") : (lang === "zh" ? "启用" : "Enable")}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggleEnabled}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="ring-wrap">
        <svg className="ring" width="148" height="148" viewBox="0 0 148 148">
          <circle
            className="ring-bg"
            cx="74"
            cy="74"
            r={R}
            fill="none"
            strokeWidth="10"
          />
          <circle
            className="ring-fg"
            cx="74"
            cy="74"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            transform="rotate(-90 74 74)"
          />
        </svg>
        <div className="ring-center">
          <span className="ring-time">{timeDisplay}</span>
          <span className="ring-status">{status}</span>
        </div>
      </div>

      <button
        className="skip-btn"
        onClick={onSkip}
        disabled={!enabled || fired || paused}
        title={lang === "zh" ? "立即触发该提醒" : "Trigger this reminder immediately"}
      >
        {t.skipButton}
      </button>
    </div>
  );
}
