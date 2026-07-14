#!/usr/bin/env bash
# 构建久坐提醒应用,完成后把生成的安装包拷贝到项目根目录的 outputs/ 下。
# 跨平台:macOS 收集 .dmg,Windows 收集 .msi / .exe(NSIS)。
# 用法: ./scripts/build.sh   或   bun run dist
set -euo pipefail

# 定位项目根目录(本脚本位于 scripts/ 下)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUTPUT_DIR="outputs"

echo "==> 1/3 执行 tauri build..."
if [ "$(uname)" = "Darwin" ]; then
  echo "    [macOS] 检测到 Mac 系统，尝试配置 x86_64 & aarch64 双架构独立分包编译..."
  rustup target add x86_64-apple-darwin aarch64-apple-darwin 2>/dev/null || true
  
  has_aarch64=false
  has_x86_64=false
  
  if echo "fn main() {}" | rustc --target aarch64-apple-darwin - -o ./target_check 2>/dev/null; then
    has_aarch64=true
    rm -f ./target_check
  fi
  if echo "fn main() {}" | rustc --target x86_64-apple-darwin - -o ./target_check 2>/dev/null; then
    has_x86_64=true
    rm -f ./target_check
  fi
  
  if [ "$has_aarch64" = true ] && [ "$has_x86_64" = true ]; then
    echo "    [macOS] 支持双架构，依次执行 aarch64 和 x86_64 独立编译..."
    bun run tauri build --target aarch64-apple-darwin
    bun run tauri build --target x86_64-apple-darwin
  else
    echo "    ⚠️ 警告: 当前环境不支持双架构编译，将回退到默认本地架构编译..."
    rm -f ./target_check 2>/dev/null || true
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
# 依次检索多平台和多架构下的产物目录，不支持的目录会自动跳过
for src in \
  src-tauri/target/release/bundle/dmg/*.dmg \
  src-tauri/target/*/release/bundle/dmg/*.dmg \
  src-tauri/target/release/bundle/msi/*.msi \
  src-tauri/target/release/bundle/nsis/*.exe; do
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
