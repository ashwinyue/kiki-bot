#!/bin/bash
# 等待心跳通知测试脚本
# 用于测试心跳守护是否在指定时间后触发

echo "⏰ 心跳守护测试"
echo "================"
echo ""
echo "当前时间: $(date '+%H:%M:%S')"
echo "守护进程状态:"
./custom/scripts/heartbeat.sh status
echo ""
echo "待办任务数量: $(grep -c '\- \[ \]' .claude/personalities/HEARTBEAT.md)"
echo ""
echo "⏳ 等待下一次心跳提醒（约1分钟）..."
echo ""
echo "📍 你应该会在约 1 分钟后收到系统通知"
echo "   通知内容: 💓 心跳提醒: 9 个待办任务"
echo ""
echo "💡 提示:"
echo "   - macOS: 右上角会弹出通知"
echo "   - 通知可能会显示几秒后消失"
echo "   - 可以在系统通知中心查看历史通知"
echo ""
echo "监控日志中..."
echo ""

# 监控日志文件
tail -f ~/.heartbeat-daemon.log 2>/dev/null &
LOG_PID=$!

# 等待70秒（1分钟 + 10秒缓冲）
sleep 70

# 停止日志监控
kill $LOG_PID 2>/dev/null

echo ""
echo "✅ 测试完成！"
echo ""
echo "验证结果:"
./custom/scripts/heartbeat.sh status
echo ""
echo "查看完整日志:"
echo "  cat ~/.heartbeat-daemon.log"
echo ""
echo "停止守护:"
echo "  ./custom/scripts/heartbeat.sh stop"
