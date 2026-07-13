import { getCurrentWindow } from "@tauri-apps/api/window";

/** 隐藏主窗口到系统托盘(应用仍在后台运行)。 */
export async function hideToTray(): Promise<void> {
  try {
    await getCurrentWindow().hide();
  } catch {
    // ignore(例如浏览器开发环境)
  }
}

/** 显示并聚焦主窗口。 */
export async function showMainWindow(): Promise<void> {
  try {
    const win = getCurrentWindow();
    await win.show();
    await win.setFocus();
  } catch {
    // ignore
  }
}
