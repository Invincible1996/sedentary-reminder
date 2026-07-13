export type ReminderType = "exercise" | "water";
export type Language = "zh" | "en";
export type AppTheme = "dark" | "light" | "forest" | "sakura" | "sunset" | "cyber" | "ocean" | "lava";

export interface ReminderConfig {
  enabled: boolean;
  intervalMinutes: number;
  /** 强制模式:到点弹出全屏置顶遮罩,无法手动取消,倒计时结束才自动消失。 */
  forceMode: boolean;
}

export interface Settings {
  exercise: ReminderConfig;
  water: ReminderConfig;
  soundEnabled: boolean;
  autoStart: boolean;
  muteInFullscreen?: boolean;
  /** 每次提醒的休息时长(秒),全屏倒计时按此显示。 */
  breakSeconds: number;
  theme?: AppTheme;
  lang: Language;
}

export interface Stats {
  date: string; // YYYY-MM-DD(本地)
  exercise: number;
  water: number;
}
