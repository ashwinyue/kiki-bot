#!/bin/bash
# HEARTBEAT 快速启动脚本

echo "💓 HEARTBEAT 守护进程快速启动"
echo "================================"
echo ""

# 检查是否已在运行
if [ -f "$HOME/.heartbeat-daemon.pid" ]; then
  PID=$(cat "$HOME/.heartbeat-daemon.pid")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ 守护进程已在运行"
    echo "   PID: $PID"
    echo "   间隔: 30 分钟"
    echo ""
    echo "💡 常用命令:"
    echo "   - 查看状态: ./custom/scripts/heartbeat-service.sh status"
    echo "   - 查看日志: ./custom/scripts/heartbeat-service.sh logs"
    echo "   - 停止守护: ./custom/scripts/heartbeat-service.sh stop"
    echo "   - 重启守护: ./custom/scripts/heartbeat-service.sh restart"
    echo ""
    echo "📚 详细文档: docs/HEARTBEAT-DAEMON-GUIDE.md"
    exit 0
  fi
fi

# 启动守护进程
echo "🚀 启动 HEARTBEAT 守护进程..."
./custom/scripts/heartbeat-service.sh start 30

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 启动成功！"
  echo ""
  echo "💓 守护进程现在会："
  echo "   - 每 30 分钟检查 HEARTBEAT.md 中的任务"
  echo "   - 通过系统通知发送提醒"
  echo "   - 在后台 24/7 运行"
  echo ""
  echo "💡 下一步："
  echo "   1. 编辑 .claude/personalities/HEARTBEAT.md 添加你的任务"
  echo "   2. 标记完成的任务（使用 [x] 而非 [ ]）"
  echo "   3. 等待 30 分钟后收到第一个提醒"
  echo ""
  echo "📚 详细文档: docs/HEARTBEAT-DAEMON-GUIDE.md"
else
  echo ""
  echo "❌ 启动失败"
  echo "   请检查日志: ~/.heartbeat-daemon.log"
  exit 1
fi
