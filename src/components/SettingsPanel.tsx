import { useState, useEffect, useRef } from "react";
import { AppTheme, Language, ReminderType, Settings, PopupType } from "../types";
import { I18N_TRANSLATIONS } from "../lib/i18n";

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
  onClose: () => void;
  onResetStats?: () => void;
}

const THEME_OPTIONS: { id: AppTheme; key: string }[] = [
  { id: "dark", key: "themeDark" },
  { id: "light", key: "themeLight" },
  { id: "forest", key: "themeForest" },
  { id: "sakura", key: "themeSakura" },
  { id: "sunset", key: "themeSunset" },
  { id: "cyber", key: "themeCyber" },
  { id: "ocean", key: "themeOcean" },
  { id: "lava", key: "themeLava" },
];

const POPUP_OPTIONS: { id: PopupType; key: string }[] = [
  { id: "fullscreen", key: "popupTypeFullscreen" },
  { id: "center", key: "popupTypeCenter" },
  { id: "topLeft", key: "popupTypeTopLeft" },
  { id: "topRight", key: "popupTypeTopRight" },
  { id: "bottomLeft", key: "popupTypeBottomLeft" },
  { id: "bottomRight", key: "popupTypeBottomRight" },
];

function formatBreakDuration(seconds: number, lang: Language): string {
  const t = I18N_TRANSLATIONS[lang];
  if (seconds < 60) {
    return `${seconds}${t.secondUnit}`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) {
    return `${m}${t.minuteUnit}`;
  }
  return `${m}${t.minuteUnit}${s}${t.secondUnit}`;
}

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  ticks: number[];
}

function CustomSlider({ min, max, step, value, onChange, ticks }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-wrapper">
      <div className="slider-container">
        <div className="slider-track-bg" />
        <div className="slider-track-fill" style={{ width: `${pct}%` }} />
        <div className="slider-ticks">
          {ticks.map((t) => {
            const tickPct = ((t - min) / (max - min)) * 100;
            return (
              <span
                key={t}
                className={`slider-tick${value >= t ? " active" : ""}`}
                style={{ left: `${tickPct}%` }}
              />
            );
          })}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

interface SelectOption {
  id: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
}

function CustomSelect({ value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="custom-select-container" ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : ""}</span>
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`custom-select-option${opt.id === value ? " selected" : ""}`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {opt.id === value && (
                <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, onClose, onResetStats }: Props) {
  const lang = settings.lang || "zh";
  const t = I18N_TRANSLATIONS[lang];

  const setReminder = (type: ReminderType, patch: Partial<Settings["exercise"]>) =>
    onChange({ ...settings, [type]: { ...settings[type], ...patch } });

  // Ticks for Stand Up and Drink Water intervals: every 10 min from 10 to 120
  const intervalTicks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  // Ticks for break duration: every 1 min (60s) from 60 to 600
  const breakTicks = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];

  const selectThemeOptions = THEME_OPTIONS.map((theme) => ({
    id: theme.id,
    label: t[theme.key],
  }));

  const selectPopupOptions = POPUP_OPTIONS.map((opt) => ({
    id: opt.id,
    label: t[opt.key],
  }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{t.settings}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        </div>

        <div className="settings-group">
          <label className="settings-label">
            {t.exerciseInterval} ({settings.exercise.intervalMinutes} {t.minuteUnit})
          </label>
          <CustomSlider
            min={5}
            max={120}
            step={5}
            value={settings.exercise.intervalMinutes}
            onChange={(val) => setReminder("exercise", { intervalMinutes: val })}
            ticks={intervalTicks}
          />
          <div className="settings-row settings-row-inset">
            <div>
              <div className="settings-label">{t.forceModeLabel}</div>
              <div className="settings-hint">{t.forceModeHint}</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.exercise.forceMode}
                onChange={(e) =>
                  setReminder("exercise", { forceMode: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        <div className="settings-group">
          <label className="settings-label">
            {t.waterInterval} ({settings.water.intervalMinutes} {t.minuteUnit})
          </label>
          <CustomSlider
            min={5}
            max={120}
            step={5}
            value={settings.water.intervalMinutes}
            onChange={(val) => setReminder("water", { intervalMinutes: val })}
            ticks={intervalTicks}
          />
          <div className="settings-row settings-row-inset">
            <div>
              <div className="settings-label">{t.forceModeLabel}</div>
              <div className="settings-hint">{t.forceModeHint}</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.water.forceMode}
                onChange={(e) =>
                  setReminder("water", { forceMode: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        <div className="settings-group">
          <label className="settings-label">
            {t.breakDuration} ({formatBreakDuration(settings.breakSeconds, lang)})
          </label>
          <CustomSlider
            min={10}
            max={600}
            step={10}
            value={settings.breakSeconds}
            onChange={(val) => onChange({ ...settings, breakSeconds: val })}
            ticks={breakTicks}
          />
        </div>

        {/* 主题选择行 */}
        <div className="settings-row">
          <div>
            <div className="settings-label">{t.themeLabel}</div>
            <div className="settings-hint">{t.themeHint}</div>
          </div>
          <CustomSelect
            value={settings.theme || "dark"}
            options={selectThemeOptions}
            onChange={(val) => onChange({ ...settings, theme: val as AppTheme })}
          />
        </div>

        {/* 弹窗方式选择行 */}
        <div className="settings-row">
          <div>
            <div className="settings-label">{t.popupTypeLabel}</div>
            <div className="settings-hint">{t.popupTypeHint}</div>
          </div>
          <CustomSelect
            value={settings.popupType || "fullscreen"}
            options={selectPopupOptions}
            onChange={(val) => onChange({ ...settings, popupType: val as PopupType })}
          />
        </div>

        {/* 语言选择行 */}
        <div className="settings-row">
          <div>
            <div className="settings-label">{t.languageLabel}</div>
            <div className="settings-hint">{t.languageHint}</div>
          </div>
          <div className="interval-options" style={{ flexWrap: "nowrap" }}>
            <button
              className={`chip${settings.lang === "zh" ? " active" : ""}`}
              onClick={() => onChange({ ...settings, lang: "zh" })}
              style={{ padding: "6px 10px", fontSize: "12.5px" }}
            >
              简体中文
            </button>
            <button
              className={`chip${settings.lang === "en" ? " active" : ""}`}
              onClick={() => onChange({ ...settings, lang: "en" })}
              style={{ padding: "6px 10px", fontSize: "12.5px" }}
            >
              English
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">{t.autoStartLabel}</div>
            <div className="settings-hint">{t.autoStartHint}</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.autoStart}
              onChange={(e) => onChange({ ...settings, autoStart: e.target.checked })}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">{t.soundEnabledLabel}</div>
            <div className="settings-hint">{t.soundEnabledHint}</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                onChange({ ...settings, soundEnabled: e.target.checked })
              }
            />
            <span className="slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">{t.muteInFullscreenLabel}</div>
            <div className="settings-hint">{t.muteInFullscreenHint}</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.muteInFullscreen ?? true}
              onChange={(e) =>
                onChange({ ...settings, muteInFullscreen: e.target.checked })
              }
            />
            <span className="slider" />
          </label>
        </div>

        {onResetStats && (
          <div className="settings-row">
            <div>
              <div className="settings-label">{t.resetStatsLabel}</div>
              <div className="settings-hint">{t.resetStatsHint}</div>
            </div>
            <button className="btn-reset-stats" onClick={onResetStats}>
              {t.resetStatsBtn}
            </button>
          </div>
        )}

        <p className="settings-note">
          {t.settingsSavedNote}
        </p>
      </div>
    </div>
  );
}
