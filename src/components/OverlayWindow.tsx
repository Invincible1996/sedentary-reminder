import { emit } from "@tauri-apps/api/event";
import { Language, ReminderType, PopupType } from "../types";
import ReminderOverlay from "./ReminderOverlay";

/** 遮罩窗口专用根组件:从 URL 读取参数,渲染全屏提醒。 */
export const OVERLAY_DONE = "sr-overlay-done";
export const OVERLAY_SNOOZE = "sr-overlay-snooze";

export default function OverlayWindow() {
  const params = new URLSearchParams(window.location.search);
  const type = (params.get("type") as ReminderType) || "exercise";
  const force = params.get("force") === "1";
  const endAt = Number(params.get("endAt")) || Date.now();
  const messageIndex = Number(params.get("mi")) || 0;
  const lang = (params.get("lang") as Language) || "zh";
  const popupType = (params.get("pt") as PopupType) || "fullscreen";

  return (
    <ReminderOverlay
      type={type}
      force={force}
      endAt={endAt}
      messageIndex={messageIndex}
      lang={lang}
      popupType={popupType}
      onComplete={() => void emit(OVERLAY_DONE)}
      onSnooze={(minutes) => void emit(OVERLAY_SNOOZE, minutes)}
    />
  );
}
