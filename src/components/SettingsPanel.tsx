import { AppTheme, Language, ReminderType, Settings } from "../types";
import { I18N_TRANSLATIONS } from "../lib/i18n";

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
  onClose: () => void;
}

const INTERVAL_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120];
// 休息时长选项(秒)
const BREAK_OPTIONS = [30, 60, 180, 300, 600];

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

function breakLabel(seconds: number, lang: Language): string {
  const t = I18N_TRANSLATIONS[lang];
  return seconds >= 60
    ? `${seconds / 60} ${t.minuteUnit}`
    : `${seconds} ${t.secondUnit}`;
}

export default function SettingsPanel({ settings, onChange, onClose }: Props) {
  const lang = settings.lang || "zh";
  const t = I18N_TRANSLATIONS[lang];

  const setReminder = (type: ReminderType, patch: Partial<Settings["exercise"]>) =>
    onChange({ ...settings, [type]: { ...settings[type], ...patch } });

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
          <label className="settings-label">{t.exerciseInterval}</label>
          <div className="interval-options">
            {INTERVAL_OPTIONS.map((m) => (
              <button
                key={m}
                className={`chip${settings.exercise.intervalMinutes === m ? " active" : ""}`}
                onClick={() => setReminder("exercise", { intervalMinutes: m })}
              >
                {m} {t.minuteUnit}
              </button>
            ))}
          </div>
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
          <label className="settings-label">{t.waterInterval}</label>
          <div className="interval-options">
            {INTERVAL_OPTIONS.map((m) => (
              <button
                key={m}
                className={`chip${settings.water.intervalMinutes === m ? " active" : ""}`}
                onClick={() => setReminder("water", { intervalMinutes: m })}
              >
                {m} {t.minuteUnit}
              </button>
            ))}
          </div>
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
          <label className="settings-label">{t.breakDuration}</label>
          <div className="interval-options">
            {BREAK_OPTIONS.map((s) => (
              <button
                key={s}
                className={`chip${settings.breakSeconds === s ? " active" : ""}`}
                onClick={() => onChange({ ...settings, breakSeconds: s })}
              >
                {breakLabel(s, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* 主题选择行 */}
        <div className="settings-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
          <div>
            <div className="settings-label">{t.themeLabel}</div>
            <div className="settings-hint">{t.themeHint}</div>
          </div>
          <div className="interval-options" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                className={`chip${settings.theme === theme.id ? " active" : ""}`}
                onClick={() => onChange({ ...settings, theme: theme.id })}
                style={{ padding: "6px 10px", fontSize: "12.5px", whiteSpace: "nowrap" }}
              >
                {t[theme.key]}
              </button>
            ))}
          </div>
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

        <p className="settings-note">
          {t.settingsSavedNote}
        </p>
      </div>
    </div>
  );
}
