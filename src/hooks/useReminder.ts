import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ReminderConfig, ReminderType } from "../types";

const MINUTE = 60_000;

interface UseReminderArgs {
  type: ReminderType;
  config: ReminderConfig;
  paused: boolean; // 全局暂停
  muteInFullscreen?: boolean; // 全屏是否静音
  onFire: (type: ReminderType) => void;
}

interface UseReminderResult {
  remainingSeconds: number;
  progress: number; // 0..1
  fired: boolean;
  isRunning: boolean;
  skip: () => void;
  snooze: (minutes: number) => void;
  complete: () => void;
}

/**
 * 单个提醒类型的计时器。基于绝对时间戳 nextFireAt 计算剩余时间,
 * 因此窗口隐藏/失焦被节流后,恢复时能即时按真实时间补算,不会累积漂移。
 */
export function useReminder({
  type,
  config,
  paused,
  muteInFullscreen = true,
  onFire,
}: UseReminderArgs): UseReminderResult {
  const [remainingSeconds, setRemainingSeconds] = useState(
    config.intervalMinutes * 60
  );
  const [progress, setProgress] = useState(0);
  const [fired, setFired] = useState(false);

  const nextFireAtRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const onFireRef = useRef(onFire);
  const intervalRef = useRef(config.intervalMinutes);
  const enabledRef = useRef(config.enabled);
  const muteInFullscreenRef = useRef(muteInFullscreen);

  useEffect(() => {
    onFireRef.current = onFire;
  }, [onFire]);

  useEffect(() => {
    muteInFullscreenRef.current = muteInFullscreen;
  }, [muteInFullscreen]);

  // 间隔或启用状态变化时,重新初始化一个周期
  useEffect(() => {
    intervalRef.current = config.intervalMinutes;
    enabledRef.current = config.enabled;
    firedRef.current = false;
    setFired(false);

    if (!config.enabled) {
      nextFireAtRef.current = null;
      pausedRemainingRef.current = null;
      setRemainingSeconds(0);
      setProgress(0);
      return;
    }

    if (paused) {
      pausedRemainingRef.current = config.intervalMinutes * MINUTE;
      nextFireAtRef.current = null;
      setRemainingSeconds(config.intervalMinutes * 60);
      setProgress(0);
    } else {
      nextFireAtRef.current = Date.now() + config.intervalMinutes * MINUTE;
      pausedRemainingRef.current = null;
    }
    // 暂停状态的变化由下面的 effect 单独处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.intervalMinutes, config.enabled]);

  // 处理全局暂停 / 恢复
  useEffect(() => {
    if (paused) {
      if (nextFireAtRef.current != null && !firedRef.current) {
        pausedRemainingRef.current = Math.max(
          0,
          nextFireAtRef.current - Date.now()
        );
        nextFireAtRef.current = null;
      }
    } else if (enabledRef.current && !firedRef.current) {
      const rem =
        pausedRemainingRef.current ?? intervalRef.current * MINUTE;
      nextFireAtRef.current = Date.now() + rem;
      pausedRemainingRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const tick = useCallback(() => {
    if (!enabledRef.current) return;
    if (firedRef.current) {
      setRemainingSeconds(0);
      setProgress(1);
      return;
    }
    const next = nextFireAtRef.current;
    if (next == null) {
      // 暂停中:展示暂停时剩余时间
      const rem =
        pausedRemainingRef.current ?? intervalRef.current * MINUTE;
      const total = intervalRef.current * MINUTE;
      setRemainingSeconds(Math.ceil(rem / 1000));
      setProgress(1 - rem / total);
      return;
    }
     const remMs = next - Date.now();
    if (remMs <= 0) {
      if (muteInFullscreenRef.current) {
        // 触发提醒前先检查是否在全屏观看视频/打游戏
        invoke<boolean>("is_any_app_fullscreen")
          .then((isFullscreen) => {
            if (isFullscreen) {
              // 全屏状态下推迟 15 秒后再尝试触发，避免打扰用户
              nextFireAtRef.current = Date.now() + 15 * 1000;
              return;
            }
            firedRef.current = true;
            setFired(true);
            setRemainingSeconds(0);
            setProgress(1);
            onFireRef.current(type);
          })
          .catch(() => {
            // 兜底: 异常情况下直接触发
            firedRef.current = true;
            setFired(true);
            setRemainingSeconds(0);
            setProgress(1);
            onFireRef.current(type);
          });
      } else {
        // 全屏不静音: 直接触发
        firedRef.current = true;
        setFired(true);
        setRemainingSeconds(0);
        setProgress(1);
        onFireRef.current(type);
      }
      return;
    }
    const total = intervalRef.current * MINUTE;
    setRemainingSeconds(Math.ceil(remMs / 1000));
    setProgress(1 - remMs / total);
  }, [type]);

  useEffect(() => {
    const id = window.setInterval(tick, 500);
    const onVisible = () => tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [tick]);

  const resetCycle = useCallback(
    (durationMs: number) => {
      firedRef.current = false;
      setFired(false);
      if (!enabledRef.current) return;
      if (paused) {
        pausedRemainingRef.current = durationMs;
        nextFireAtRef.current = null;
      } else {
        nextFireAtRef.current = Date.now() + durationMs;
        pausedRemainingRef.current = null;
      }
    },
    [paused]
  );

  const complete = useCallback(() => {
    resetCycle(intervalRef.current * MINUTE);
  }, [resetCycle]);

  const snooze = useCallback(
    (minutes: number) => {
      resetCycle(minutes * MINUTE);
    },
    [resetCycle]
  );

  const skip = useCallback(() => {
    if (!enabledRef.current || firedRef.current) return;
    firedRef.current = true;
    setFired(true);
    setRemainingSeconds(0);
    setProgress(1);
    onFireRef.current(type);
  }, [type]);

  return {
    remainingSeconds,
    progress,
    fired,
    isRunning: config.enabled && !fired && !paused,
    skip,
    snooze,
    complete,
  };
}
