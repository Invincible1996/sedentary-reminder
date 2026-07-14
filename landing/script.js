document.addEventListener("DOMContentLoaded", () => {
  // 1. OS 检测与主下载按钮智能分发
  const primaryDownloadBtn = document.getElementById("primaryDownloadBtn");
  const primaryBtnIcon = document.getElementById("primaryBtnIcon");
  const primaryBtnTitle = document.getElementById("primaryBtnTitle");

  const userAgent = navigator.userAgent.toLowerCase();
  let downloadUrl = "#download"; // 默认跳转到下载区域
  let osTitle = "全平台版本";
  let osIcon = "📦";

  if (userAgent.indexOf("mac") !== -1) {
    // macOS
    osTitle = "macOS (Apple Silicon M系列芯片)";
    osIcon = "🍏";
    downloadUrl = "../outputs/sedentary-reminder_1.0.0_aarch64.dmg"; // 默认提供 M系列包
  } else if (userAgent.indexOf("win") !== -1) {
    // Windows
    osTitle = "Windows (64位 离线版)";
    osIcon = "🪟";
    downloadUrl = "../outputs/sedentary-reminder_1.0.0_x64-setup.exe";
  }

  if (primaryDownloadBtn) {
    primaryDownloadBtn.href = downloadUrl;
    if (primaryBtnIcon) primaryBtnIcon.textContent = osIcon;
    if (primaryBtnTitle) primaryBtnTitle.textContent = osTitle;
  }

  // 2. 交互式主题预览器
  const appMockup = document.getElementById("appMockup");
  const themeChips = document.querySelectorAll(".theme-chip");

  themeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      // 1. 清空所有 active 样式
      themeChips.forEach((c) => c.classList.remove("active"));
      // 2. 激活当前点击的芯片
      chip.classList.add("active");

      // 3. 提取目标主题并更换 Mockup 窗口的 class
      const targetTheme = chip.getAttribute("data-theme");
      if (appMockup) {
        // 清除旧的样式
        appMockup.className = "mockup-window";
        // 添加新样式
        appMockup.classList.add(`${targetTheme}-theme`);
      }
    });
  });

  // 3. 数字递增微动效 (Mockup Stats Count-up)
  const animateValue = (id, start, end, duration) => {
    const obj = document.getElementById(id);
    if (!obj) return;
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    const timer = setInterval(() => {
      current += increment;
      obj.textContent = current;
      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
  };

  // 页面加载 0.8 秒后触发数字递增动画
  setTimeout(() => {
    animateValue("mockupExercise", 0, 12, 1200);
    animateValue("mockupWater", 0, 8, 1200);
  }, 800);
});
