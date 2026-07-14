#!/usr/bin/env bash
# 构建久坐提醒应用,完成后把生成的安装包拷贝到项目根目录的 outputs/ 下。
# 跨平台:macOS 收集 .dmg,Windows 收集 .msi / .exe(NSIS)。
# 用法: ./scripts/build.sh   或   bun run dist
set -euo pipefail

# 定位项目根目录(本脚本位于 scripts/ 下)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUNDLE_DIR="src-tauri/target/release/bundle"
OUTPUT_DIR="outputs"

echo "==> 1/3 执行 tauri build..."
if [ "$(uname)" = "Darwin" ]; then
  echo "    [macOS] 检测到 Mac 系统，尝试配置 x86_64 & aarch64 混合编译..."
  rustup target add x86_64-apple-darwin aarch64-apple-darwin 2>/dev/null || true
  
  if echo "fn main() {}" | rustc --target x86_64-apple-darwin - -o /dev/null 2>/dev/null; then
    echo "    [macOS] 目标编译测试成功，执行 Universal 混合编译..."
    bun run tauri build --target universal-apple-darwin
  else
    echo "    ⚠️ 警告: 当前编译器不支持编译 x86_64-apple-darwin 目标链(可能当前使用的是 Homebrew 版单架构 rustc)。"
    echo "    提示: 如需本地编译 Universal/Intel 包，请确保使用 rustup 并安装了相应架构的目标包。"
    echo "    现在回退到当前架构进行普通编译..."
    bun run tauri build
  fi
else
  bun run tauri build
fi

echo "==> 2/3 收集构建产物到 $OUTPUT_DIR/ ..."
mkdir -p "$OUTPUT_DIR"
# 清空旧产物,避免不同平台残留混淆
rm -f "$OUTPUT_DIR"/*.dmg "$OUTPUT_DIR"/*.msi "$OUTPUT_DIR"/*.exe 2>/dev/null || true

count=0
# 依次尝试各平台的产物目录,不存在的会被跳过
for src in \
  "$BUNDLE_DIR"/dmg/*.dmg \
  "$BUNDLE_DIR"/msi/*.msi \
  "$BUNDLE_DIR"/nsis/*.exe; do
  [ -f "$src" ] || continue
  cp -f "$src" "$OUTPUT_DIR/"
  echo "    + $(basename "$src")"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "错误:未找到任何构建产物(dmg/msi/exe)" >&2
  exit 1
fi

echo "==> 3/3 完成"
echo "    产物目录:$ROOT_DIR/$OUTPUT_DIR"
ls -lh "$OUTPUT_DIR/"
