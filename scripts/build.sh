#!/usr/bin/env bash

set -euxo pipefail

if [ -d "dist" ]; then
  rm -rf dist
fi

pnpm lingui:compile
pnpm build:frontend
pnpm build:backend
node ./scripts/verify-static-assets.mjs

# 复制模板目录到 dist，排除 .DS_Store 等系统文件
echo "正在复制模板目录，排除系统文件..."
rsync -av --exclude='.DS_Store' --exclude='Thumbs.db' --exclude='.gitkeep' \
  template-to-project/ dist/template-to-project/

echo "模板目录复制完成！"

# 创建 .bolts 目录（如果不存在）
mkdir -p .bolts

# 打包并移动到 .bolts 目录
echo "正在打包 npm 包..."
pnpm pack

# 移动生成的 .tgz 文件到 .bolts 目录
echo "正在移动打包文件到 .bolts/ 目录..."
mv -f ctrip-spec-forge-*.tgz .bolts/

echo "✅ 构建完成！打包文件已保存到 .bolts/ 目录"
