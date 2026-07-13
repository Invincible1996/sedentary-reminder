import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Language, ReminderType } from "../types";
import {
  copyAt,
} from "../lib/content";
import { I18N_TRANSLATIONS } from "../lib/i18n";
import ExerciseIcon from "./icons/ExerciseIcon";
import WaterIcon from "./icons/WaterIcon";

interface Props {
  type: ReminderType;
  /** 强制模式:无关闭按钮,必须等倒计时结束才自动消失。 */
  force: boolean;
  /** 本次休息的结束时间戳(epoch ms)。所有屏幕共享同一值以保持同步。 */
  endAt: number;
  /** 文案池下标,由主窗口随机选定并下发,保证多屏一致。 */
  messageIndex: number;
  lang: Language;
  onComplete: () => void;
  onSnooze: (minutes: number) => void;
}


/** 剩余秒数格式化为两位数 mm:ss(如 05:00、00:30)。 */
function formatRemaining(total: number): string {
  const clamped = Math.max(0, total);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ReminderOverlay({
  type,
  force,
  endAt,
  messageIndex,
  lang,
  onComplete,
  onSnooze,
}: Props) {
  const copy = copyAt(type, messageIndex, lang);
  const style = {
    "--accent": type === "exercise" ? "var(--accent-exercise)" : "var(--accent-water)",
  } as CSSProperties;
  const t = I18N_TRANSLATIONS[lang];

  // 休息倒计时:基于绝对时间戳,窗口被节流也不会漂移,多屏之间天然同步。
  const [remaining, setRemaining] = useState(() =>
    Math.ceil((endAt - Date.now()) / 1000)
  );
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setRemaining(Math.ceil((endAt - Date.now()) / 1000));

    const tick = () => {
      const remMs = endAt - Date.now();
      if (remMs <= 0) {
        setRemaining(0);
        onCompleteRef.current();
        return true;
      }
      setRemaining(Math.ceil(remMs / 1000));
      return false;
    };

    const id = window.setInterval(() => {
      if (tick()) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [endAt]);

  const hintText = force
    ? type === "water"
      ? t.forceRestHintWater
      : t.forceRestHint
    : t.restTimeRemaining;

  return (
    <div className="overlay overlay-fullscreen">
      <div className="overlay-card" style={style}>
        <div className="overlay-icon">
          {type === "exercise" ? (
            <ExerciseIcon className="overlay-svg-icon" />
          ) : (
            <WaterIcon className="overlay-svg-icon" />
          )}
        </div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="overlay-force-status">
          <div className="overlay-countdown">{formatRemaining(remaining)}</div>
          <p className="overlay-force-hint">{hintText}</p>
        </div>
        {!force && (
          <div className="overlay-actions">
            <button className="btn-primary" onClick={onComplete}>
              {t.completeRest}
            </button>
            <button className="btn-ghost" onClick={() => onSnooze(5)}>
              {t.snooze5Min}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
