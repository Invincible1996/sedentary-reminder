# 🧘 sedentary-reminder (久坐提醒) `v1.0.0`

基于 **Tauri v2** + **React** + **TypeScript** 倾力打造的健康看护桌面管家，UI 样式采用 **纯原生 CSS (Vanilla CSS)** 极限雕琢，极致轻量，极速启动。

---

## 🎨 核心特性

* 🖥️ **磨砂玻璃美学 UI**：深邃的暗色霓虹微光背景融合精细的高斯模糊（backdrop-filter），自适应圆环发光，支持 8 款精心调配的预设主题。
* 🏃 **SVG 灵动微动画**：内置精细拼接的人体拉伸骨骼运动动画与双层贝塞尔波浪物理喝水动态，生动逼真。
* 🔒 **跨屏强制休眠**：休息时间到达时强制锁屏式高斯模糊遮罩，支持多显示器同步坐标定位，提供稍后提醒与随机健康科普文案。
* 🧱 **macOS 任务调度防绕过**：强行提升窗口层级至系统屏保级（2000），脱离 Exposé/Mission Control 虚拟桌面调度，实现强制休息。
* 🖱️ **左键托盘深度绑定**：左键单击托盘即可唤出控制菜单，实时显示下次休息倒计时，支持跳过、暂停、重置等双向联动指令。
* 📅 **农历与健康统计**：深度集成中国农历面板（包含法定节假日放假与调休上班、二十四节气），提供起身与喝水的今日健康数据统计。

---

## 🛠️ 技术栈

* **后端 (Backend)**: Rust, Tauri v2
* **前端 (Frontend)**: React 19, TypeScript, Vite, Vanilla CSS

---

## 💻 本地开发指南

### 1. 安装依赖与环境
准备好 Node.js/Bun 和 Rust 环境后（Windows 下需 C++ 桌面开发工具与 WebView2，macOS 需 Xcode Command Line Tools），在根目录下执行：
```bash
bun install
```

### 2. 启动开发模式
```bash
bun run tauri dev
```

### 3. 生产打包构建
```bash
bun run dist  # 推荐，本地打包并自动收集至 outputs/ 目录
```

---

## 📦 下载与安装 (Releases)

请前往 **[GitHub Releases 页面](https://github.com/Invincible1996/sedentary-reminder/releases)** 下载最新版本的预编译包：
* 🍏 **macOS (DMG)**: 支持 Apple Silicon (M1/M2/M3) 与 Intel 芯片。
* 🪟 **Windows (EXE/MSI)**: 提供单文件 EXE 安装包与 MSI 安装包。
