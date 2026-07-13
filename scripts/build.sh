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

echo "==> 1/3 执行 tauri build(前端打包 + Rust release 编译 + 打包)..."
bun run tauri build

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
