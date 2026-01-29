#!/bin/bash
# 测试单个 hook 是否能正常执行

export CLAUDE_WORKSPACE="$(pwd)"
export CLAUDE_SESSION_START="true"

echo "测试 Hook: heartbeat-executor.js"
echo "================================="
echo "工作目录: $CLAUDE_WORKSPACE"
echo ""

# 执行 hook
node "${CLAUDE_WORKSPACE}/custom/scripts/hooks/heartbeat-executor.js" 2>&1

EXIT_CODE=$?
echo ""
echo "退出码: $EXIT_CODE"

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Hook 执行成功"
else
  echo "❌ Hook 执行失败"
fi
