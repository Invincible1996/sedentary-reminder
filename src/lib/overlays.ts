import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import {
  availableMonitors,
  primaryMonitor,
  type Monitor,
} from "@tauri-apps/api/window";
import { Language, ReminderType, PopupType } from "../types";

const PREFIX = "sr-overlay-";

// 已创建的遮罩窗口 label,用于统一销毁。
const openLabels = new Set<string>();
let runSeq = 0;

/**
 * 在每一块显示器上各创建一个全屏置顶遮罩窗口。
 * 所有窗口加载同一个前端入口(index.html?overlay=1&...),通过共享的
 * endAt 时间戳保持倒计时同步。
 */
export async function openOverlays(
  type: ReminderType,
  force: boolean,
  endAt: number,
  messageIndex: number,
  lang: Language,
  popupType: PopupType = "fullscreen"
): Promise<void> {
  try {
    let monitors: Monitor[] = [];
    try {
      monitors = await availableMonitors();
    } catch {
      // ignore
    }
    // 兜底:若枚举不到,至少用主显示器
    if (monitors.length === 0) {
      try {
        const pm = await primaryMonitor();
        if (pm) monitors = [pm];
      } catch {
        // ignore
      }
    }

    const runId = ++runSeq;
    const targets: (Monitor | null)[] = monitors.length > 0 ? monitors : [null];

    await Promise.all(
      targets.map((m, i) =>
        createOne(`${PREFIX}${runId}-${i}`, m, type, force, endAt, messageIndex, lang, popupType, i === 0)
      )
    );
  } catch (err) {
    console.error("Failed to open overlays:", err);
  }
}

async function createOne(
  label: string,
  monitor: Monitor | null,
  type: ReminderType,
  force: boolean,
  endAt: number,
  messageIndex: number,
  lang: Language,
  popupType: PopupType,
  focus: boolean
): Promise<void> {
  const url = `index.html?overlay=1&type=${type}&force=${force ? 1 : 0}&endAt=${endAt}&mi=${messageIndex}&lang=${lang}&pt=${popupType}`;

  let x: number | undefined;
  let y: number | undefined;
  let w: number | undefined;
  let h: number | undefined;

  if (monitor) {
    // Tauri 按「各显示器自身物理像素」上报 position/size,混合 DPI 下
    // 全局物理坐标会重叠。统一除以各自 scaleFactor 换算成逻辑点,
    // 再用 Logical 单位定位,得到一致的跨屏布局。
    const scale = monitor.scaleFactor || 1;
    const mX = Math.round(monitor.position.x / scale);
    const mY = Math.round(monitor.position.y / scale);
    const mW = Math.round(monitor.size.width / scale);
    const mH = Math.round(monitor.size.height / scale);

    if (popupType === "fullscreen") {
      x = mX;
      y = mY;
      w = mW;
      h = mH;
    } else {
      // 小尺寸弹窗定位
      w = 400;
      h = 260;
      x = mX + (mW - w) / 2;
      y = mY + (mH - h) / 2;

      if (popupType === "topLeft") {
        x = mX + 24;
        y = mY + 24;
      } else if (popupType === "topRight") {
        x = mX + mW - w - 24;
        y = mY + 24;
      } else if (popupType === "bottomLeft") {
        x = mX + 24;
        y = mY + mH - h - 40;
      } else if (popupType === "bottomRight") {
        x = mX + mW - w - 24;
        y = mY + mH - h - 40; // 底部偏移 40px 以防遮挡 Dock/任务栏
      }
    }
  }

  const win = new WebviewWindow(label, {
    url,
    x,
    y,
    width: w,
    height: h,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    closable: false, // 禁止 Cmd+W 关闭;由主窗口统一销毁
    focus,
    visible: true, // 立即显示
    transparent: popupType !== "fullscreen",
    shadow: false, // 禁用 OS 阴影以消除 macOS 的白边/白角
    title: "久坐提醒",
  });
  openLabels.add(label);

  try {
    await win.setAlwaysOnTop(true);
    // macOS: 叠加在其他应用(含全屏应用)之上
    await win.setVisibleOnAllWorkspaces(true);
    if (focus) await win.setFocus();
    try {
      await invoke("setup_overlay_window", { 
        label, 
        isFullscreen: popupType === "fullscreen" 
      });
    } catch {
      // ignore
    }
  } catch (err) {
    console.error("Failed to setup overlay window properties:", err);
  }
}

/** 销毁全部遮罩窗口。 */
export async function closeOverlays(): Promise<void> {
  const labels = [...openLabels];
  openLabels.clear();
  await Promise.all(
    labels.map(async (label) => {
      try {
        const win = await WebviewWindow.getByLabel(label);
        if (win) await win.destroy();
      } catch {
        // ignore
      }
    })
  );
}
