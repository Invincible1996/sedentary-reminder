import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { ReminderType } from "../types";
import { REMINDER_COPY, REMINDER_ICONS } from "./content";
import { loadSettings } from "./storage";

function randomCopy(type: ReminderType): { title: string; body: string } {
  const settings = loadSettings();
  const lang = settings.lang || "zh";
  const pool = REMINDER_COPY[lang][type];
  const icons = REMINDER_ICONS[type];
  const c = pool[Math.floor(Math.random() * pool.length)];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  return { title: `${c.title} ${icon}`, body: c.body };
}

/** 确保已获得通知权限(首次会触发系统授权弹窗)。 */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const perm = await requestPermission();
      granted = perm === "granted";
    }
    return granted;
  } catch {
    return false;
  }
}

/** 发送一次桌面通知。 */
export async function notifyReminder(type: ReminderType): Promise<void> {
  try {
    const granted = await ensureNotificationPermission();
    if (!granted) return;
    const { title, body } = randomCopy(type);
    await sendNotification({ title, body });
  } catch {
    // ignore
  }
}
