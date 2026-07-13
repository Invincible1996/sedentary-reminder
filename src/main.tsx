import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App";
import OverlayWindow from "./components/OverlayWindow";

// 同一前端两种角色:带 ?overlay=1 的窗口渲染全屏遮罩,否则渲染主界面。
const isOverlay = new URLSearchParams(window.location.search).has("overlay");

// 在最开始读取主题并应用到 html 元素上，防止闪烁
try {
  const savedSettingsRaw = localStorage.getItem("sedentary-reminder:settings");
  const themes = ["dark", "light", "forest", "sakura", "sunset", "cyber", "ocean", "lava"];
  let activeTheme = "dark";
  if (savedSettingsRaw) {
    const savedSettings = JSON.parse(savedSettingsRaw);
    if (savedSettings.theme && themes.includes(savedSettings.theme)) {
      activeTheme = savedSettings.theme;
    }
  }
  themes.forEach((t) => {
    if (t === activeTheme) {
      document.documentElement.classList.add(`${t}-theme`);
    } else {
      document.documentElement.classList.remove(`${t}-theme`);
    }
  });
} catch (e) {
  // ignore
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{isOverlay ? <OverlayWindow /> : <App />}</React.StrictMode>
);
