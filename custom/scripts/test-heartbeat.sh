#!/bin/bash
# 快速测试 HEARTBEAT 系统

echo "🧪 测试 HEARTBEAT 系统"
echo "===================="
echo ""

# 测试 1: heartbeat-executor（SessionStart）
echo "1️⃣ 测试 SessionStart 模式"
echo "--------------------------"
HEARTBEAT_MODE=start node custom/scripts/hooks/heartbeat-executor.js

echo ""
echo "2️⃣ 测试 SessionEnd 模式"
echo "--------------------------"
HEARTBEAT_MODE=end node custom/scripts/hooks/heartbeat-executor.js

echo ""
echo "3️⃣ 测试原始 heartbeat.js"
echo "--------------------------"
node custom/scripts/heartbeat.js

echo ""
echo "✅ 所有测试完成！"
echo ""
echo "💡 提示："
echo "  - SessionStart: 会话开始时自动显示今日任务"
echo "  - SessionEnd: 会话结束时提醒未完成任务"
echo "  - 查看完整文档: docs/HEARTBEAT-SYSTEM-GUIDE.md"
