import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { AppTheme, ReminderConfig, ReminderType, Settings } from "./types";
import {
  loadSettings,
  loadStats,
  saveSettings,
  saveStats,
  todayString,
} from "./lib/storage";
import { ensureNotificationPermission, notifyReminder } from "./lib/notifications";
import { hideToTray } from "./lib/window";
import { closeOverlays, openOverlays } from "./lib/overlays";
import { randomCopyIndex } from "./lib/content";
import { OVERLAY_DONE, OVERLAY_SNOOZE } from "./components/OverlayWindow";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { playBeep } from "./lib/sound";
import { useReminder } from "./hooks/useReminder";
import TimerCard from "./components/TimerCard";
import SettingsPanel from "./components/SettingsPanel";
import CalendarModal from "./components/CalendarModal";
import { I18N_TRANSLATIONS } from "./lib/i18n";

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [stats, setStats] = useState(() => loadStats());
  const [paused, setPaused] = useState(() => !settings.autoStart);
  const [activeReminder, setActiveReminder] = useState<ReminderType | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const themeMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭主题菜单
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    if (showThemeMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showThemeMenu]);

  // 启动时请求通知权限
  useEffect(() => {
    void ensureNotificationPermission();
  }, []);

  // 设置 / 统计持久化
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // 监听主题变化并应用到 html 元素上
  useEffect(() => {
    const t = settings.theme || "dark";
    const themes = ["dark", "light", "forest", "sakura", "sunset", "cyber", "ocean", "lava"];
    themes.forEach((themeName) => {
      if (themeName === t) {
        document.documentElement.classList.add(`${themeName}-theme`);
      } else {
        document.documentElement.classList.remove(`${themeName}-theme`);
      }
    });
  }, [settings.theme]);

  const handleFire = useCallback((type: ReminderType) => {
    setActiveReminder((cur) => cur ?? type);
    void notifyReminder(type);
    if (settingsRef.current.soundEnabled) playBeep();
  }, []);

  // 当前展示的提醒 → 在每块显示器上开/关全屏遮罩窗口。
  // 用 ref 记录已为哪个提醒开过遮罩,避免设置变化导致重复开窗。
  const overlayForRef = useRef<ReminderType | null>(null);
  // 多块屏会各自发一次结束事件,用它保证一次休息只处理一次。
  const busyRef = useRef(false);
  useEffect(() => {
    busyRef.current = false; // 提醒切换/结束时复位,允许下一次处理
    let cancelled = false;
    void (async () => {
      if (activeReminder) {
        if (overlayForRef.current === activeReminder) return;
        await closeOverlays(); // 切换到下一个提醒前先清掉上一批
        if (cancelled) return;
        overlayForRef.current = activeReminder;
        const force = settingsRef.current[activeReminder].forceMode;
        const endAt = Date.now() + settingsRef.current.breakSeconds * 1000;
        const mi = randomCopyIndex(activeReminder, settingsRef.current.lang);
        await openOverlays(activeReminder, force, endAt, mi, settingsRef.current.lang, settingsRef.current.popupType || "fullscreen");
      } else if (overlayForRef.current !== null) {
        overlayForRef.current = null;
        await closeOverlays();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeReminder]);

  const exercise = useReminder({
    type: "exercise",
    config: settings.exercise,
    paused,
    muteInFullscreen: settings.muteInFullscreen,
    onFire: handleFire,
  });
  const water = useReminder({
    type: "water",
    config: settings.water,
    paused,
    muteInFullscreen: settings.muteInFullscreen,
    onFire: handleFire,
  });

  const updateReminderConfig = (
    type: ReminderType,
    patch: Partial<ReminderConfig>
  ) => {
    setSettings((s) => ({ ...s, [type]: { ...s[type], ...patch } }));
  };

  const dismissReminder = (type: ReminderType) => {
    if (type === "exercise") exercise.complete();
    else water.complete();

    setStats((s) => {
      const today = todayString();
      const base = s.date === today ? s : { date: today, exercise: 0, water: 0 };
      return { ...base, [type]: base[type] + 1 };
    });

    const other: ReminderType = type === "exercise" ? "water" : "exercise";
    const otherFired = other === "exercise" ? exercise.fired : water.fired;
    setActiveReminder(otherFired ? other : null);
  };

  const snoozeReminder = (type: ReminderType, minutes: number) => {
    if (type === "exercise") exercise.snooze(minutes);
    else water.snooze(minutes);

    const other: ReminderType = type === "exercise" ? "water" : "exercise";
    const otherFired = other === "exercise" ? exercise.fired : water.fired;
    setActiveReminder(otherFired ? other : null);
  };

  const togglePause = () => setPaused((p) => !p);

  // 遮罩窗口通过事件回传「完成/稍后」,主窗口在此统一处理。
  const activeReminderRef = useRef(activeReminder);
  activeReminderRef.current = activeReminder;
  const dismissRef = useRef(dismissReminder);
  dismissRef.current = dismissReminder;
  const snoozeRef = useRef(snoozeReminder);
  snoozeRef.current = snoozeReminder;

  // Refs and callbacks for tray menu interactions
  const exerciseRef = useRef(exercise);
  exerciseRef.current = exercise;
  const waterRef = useRef(water);
  waterRef.current = water;

  const togglePauseRef = useRef(togglePause);
  togglePauseRef.current = togglePause;

  const resetTimers = useCallback(() => {
    exerciseRef.current.complete();
    waterRef.current.complete();
  }, []);
  const resetTimersRef = useRef(resetTimers);
  resetTimersRef.current = resetTimers;

  const skipToNext = useCallback(() => {
    const exerciseSec = exerciseRef.current.remainingSeconds;
    const waterSec = waterRef.current.remainingSeconds;
    const exerciseEnabled = settingsRef.current.exercise.enabled;
    const waterEnabled = settingsRef.current.water.enabled;

    if (exerciseEnabled && waterEnabled) {
      if (exerciseSec <= waterSec) {
        exerciseRef.current.skip();
      } else {
        waterRef.current.skip();
      }
    } else if (exerciseEnabled) {
      exerciseRef.current.skip();
    } else if (waterEnabled) {
      waterRef.current.skip();
    }
  }, []);
  const skipToNextRef = useRef(skipToNext);
  skipToNextRef.current = skipToNext;

  // Sync remaining seconds to dynamic tray menu
  const exerciseSecs = exercise.remainingSeconds;
  const waterSecs = water.remainingSeconds;
  const exerciseEnabled = settings.exercise.enabled;
  const waterEnabled = settings.water.enabled;

  useEffect(() => {
    let minSecs = Infinity;
    if (exerciseEnabled && exerciseSecs > 0) {
      minSecs = Math.min(minSecs, exerciseSecs);
    }
    if (waterEnabled && waterSecs > 0) {
      minSecs = Math.min(minSecs, waterSecs);
    }

    const tDict = I18N_TRANSLATIONS[settings.lang || "zh"];
    let text = tDict.trayNoReminder;
    if (minSecs !== Infinity) {
      const minutes = Math.ceil(minSecs / 60);
      text = tDict.trayNextBreak(minutes);
    }

    void invoke("update_tray_status", {
      nextBreakText: text,
      isPaused: paused,
    });
  }, [exerciseSecs, waterSecs, exerciseEnabled, waterEnabled, paused, settings.lang]);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];
    let disposed = false;
    const register = (un: () => void) => {
      if (disposed) un();
      else unlisteners.push(un);
    };
    void listen(OVERLAY_DONE, () => {
      if (busyRef.current) return;
      const t = activeReminderRef.current;
      if (!t) return;
      busyRef.current = true;
      dismissRef.current(t);
    }).then(register);
    void listen(OVERLAY_SNOOZE, (e) => {
      if (busyRef.current) return;
      const t = activeReminderRef.current;
      if (!t) return;
      busyRef.current = true;
      snoozeRef.current(t, (e.payload as number) || 5);
    }).then(register);
    // Listeners for dynamic tray menu click events
    void listen("menu-skip", () => {
      skipToNextRef.current();
    }).then(register);
    void listen("menu-toggle-pause", () => {
      togglePauseRef.current();
    }).then(register);
    void listen("menu-reset", () => {
      resetTimersRef.current();
    }).then(register);
    return () => {
      disposed = true;
      unlisteners.forEach((un) => un());
    };
  }, []);

  const t = I18N_TRANSLATIONS[settings.lang || "zh"];

  const handleResetStats = useCallback(() => {
    if (window.confirm(t.resetStatsConfirm)) {
      setStats({ exercise: 0, water: 0, date: stats.date });
    }
  }, [t.resetStatsConfirm, stats.date]);

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

  return (
    <main className="app">
      <header className="app-header">
        <div className="app-title">
          <div className="app-logo">
            <svg viewBox="0 0 100 100" width="34" height="34" className="app-logo-svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logoGrad)" strokeWidth="6" strokeDasharray="200 60" strokeLinecap="round" opacity="0.85" />
              <circle cx="50" cy="30" r="6" fill="url(#logoGrad)" filter="url(#logoGlow)" />
              <path d="M 50 36 C 50 48, 55 52, 45 68" fill="none" stroke="url(#logoGrad)" strokeWidth="5.5" strokeLinecap="round" filter="url(#logoGlow)" />
              <path d="M 32 38 C 42 36, 48 38, 68 28" fill="none" stroke="url(#logoGrad)" strokeWidth="4.5" strokeLinecap="round" filter="url(#logoGlow)" />
              <path d="M 50 50 C 58 56, 62 62, 60 72" fill="none" stroke="url(#logoGrad)" strokeWidth="5.5" strokeLinecap="round" filter="url(#logoGlow)" />
            </svg>
          </div>
          <div className="app-title-text">
            <h1>{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="theme-select-container" style={{ position: "relative" }} ref={themeMenuRef}>
            <button
              className="icon-btn theme-toggle-btn"
              onClick={() => setShowThemeMenu((prev) => !prev)}
              title={settings.lang === "zh" ? "外观主题" : "Themes"}
              aria-label="Theme Menu"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.05 21.3 9.4 20 9.4H17C15.8954 9.4 15 8.50457 15 7.4V4.4C15 3.1 13.35 2 12.4 2C6.87716 2 2 6.87716 2 12C2 17.5228 6.87716 22 12 22Z" />
                <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
                <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
                <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
              </svg>
            </button>
            {showThemeMenu && (
              <div className="theme-dropdown-menu">
                {THEME_OPTIONS.map((theme) => {
                  const isActive = settings.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      className={`theme-menu-item${isActive ? " active" : ""}`}
                      onClick={() => {
                        setSettings((s) => ({ ...s, theme: theme.id }));
                        setShowThemeMenu(false);
                      }}
                    >
                      <span className={`theme-dot ${theme.id}`} />
                      <span className="theme-menu-text">{t[theme.key]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            className="icon-btn"
            onClick={() => setShowCalendar(true)}
            title={settings.lang === "zh" ? "查看日历" : "View Calendar"}
            aria-label="View Calendar"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          <button
            className="icon-btn"
            onClick={() => setShowSettings(true)}
            title={t.settings}
            aria-label={t.settings}
          >
            ⚙
          </button>
          <button
            className="icon-btn"
            onClick={() => void hideToTray()}
            title={t.minimizeToTray}
            aria-label={t.minimizeToTray}
          >
            —
          </button>
        </div>
      </header>

      <div className="app-content">
        <section className="stats">
        <div className="stat">
          <span className="stat-num">{stats.exercise}</span>
          <span className="stat-label">{t.todayExercise}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">{stats.water}</span>
          <span className="stat-label">{t.todayWater}</span>
        </div>
      </section>

      <section className={`control${paused ? " paused" : " running"}`}>
        <button className="play-btn" onClick={togglePause}>
          {paused ? `▶  ${t.startReminder}` : `⏸  ${t.pauseReminder}`}
        </button>
        <span className="control-status">
          {paused ? t.paused : t.running}
        </span>
      </section>

      <section className="timers">
        <TimerCard
          type="exercise"
          remainingSeconds={exercise.remainingSeconds}
          progress={exercise.progress}
          running={exercise.isRunning}
          fired={exercise.fired}
          enabled={settings.exercise.enabled}
          paused={paused}
          lang={settings.lang || "zh"}
          onToggleEnabled={() =>
            updateReminderConfig("exercise", {
              enabled: !settings.exercise.enabled,
            })
          }
          onSkip={exercise.skip}
        />
        <TimerCard
          type="water"
          remainingSeconds={water.remainingSeconds}
          progress={water.progress}
          running={water.isRunning}
          fired={water.fired}
          enabled={settings.water.enabled}
          paused={paused}
          lang={settings.lang || "zh"}
          onToggleEnabled={() =>
            updateReminderConfig("water", {
              enabled: !settings.water.enabled,
            })
          }
          onSkip={water.skip}
        />
      </section>

      <footer className="app-footer">
        {t.footerHint}
      </footer>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
          onResetStats={handleResetStats}
        />
      )}

      {showCalendar && (
        <CalendarModal
          lang={settings.lang || "zh"}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </main>
  );
}

export default App;
