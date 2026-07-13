import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import {
  availableMonitors,
  primaryMonitor,
  type Monitor,
  LogicalPosition,
  LogicalSize,
} from "@tauri-apps/api/window";
import { Language, ReminderType } from "../types";

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
  lang: Language
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
        createOne(`${PREFIX}${runId}-${i}`, m, type, force, endAt, messageIndex, lang, i === 0)
      )
    );
  } catch {
    // ignore(例如非 Tauri 的浏览器开发环境)
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
  focus: boolean
): Promise<void> {
  const url = `index.html?overlay=1&type=${type}&force=${force ? 1 : 0}&endAt=${endAt}&mi=${messageIndex}&lang=${lang}`;

  const win = new WebviewWindow(label, {
    url,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    closable: false, // 禁止 Cmd+W 关闭;由主窗口统一销毁
    focus,
    visible: false, // 先定位到目标显示器再显示,避免闪一下
    shadow: false,
    title: "久坐提醒",
  });
  openLabels.add(label);

  await new Promise<void>((resolve) => {
    win.once("tauri://created", async () => {
      try {
        if (monitor) {
          // Tauri 按「各显示器自身物理像素」上报 position/size,混合 DPI 下
          // 全局物理坐标会重叠。统一除以各自 scaleFactor 换算成逻辑点,
          // 再用 Logical 单位定位,得到一致的跨屏布局。
          const scale = monitor.scaleFactor || 1;
          await win.setPosition(
            new LogicalPosition(
              Math.round(monitor.position.x / scale),
              Math.round(monitor.position.y / scale)
            )
          );
          await win.setSize(
            new LogicalSize(
              Math.round(monitor.size.width / scale),
              Math.round(monitor.size.height / scale)
            )
          );
        }
        await win.setAlwaysOnTop(true);
        // macOS: 叠加在其他应用(含全屏应用)之上
        await win.setVisibleOnAllWorkspaces(true);
        await win.show();
        if (focus) await win.setFocus();
        try {
          await invoke("setup_overlay_window", { label });
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
      resolve();
    });
    win.once("tauri://error", () => {
      openLabels.delete(label);
      resolve();
    });
  });
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
