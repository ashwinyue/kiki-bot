#!/bin/bash
# 心跳守护控制脚本
# 用法: ./heartbeat.sh [start|stop|status|restart] [间隔(分钟)]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="${CLAUDE_WORKSPACE:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
DAEMON="$SCRIPT_DIR/heartbeat-daemon.js"

cd "$WORKSPACE" || exit 1

case "$1" in
  start)
    echo "💓 启动心跳守护..."
    node "$DAEMON" start "${2:-30}"
    ;;
  stop)
    echo "💓 停止心跳守护..."
    node "$DAEMON" stop
    ;;
  status)
    node "$DAEMON" status
    ;;
  restart)
    echo "💓 重启心跳守护..."
    node "$DAEMON" stop
    sleep 1
    node "$DAEMON" start "${2:-30}"
    ;;
  check)
    node "$SCRIPT_DIR/heartbeat.js"
    ;;
  *)
    echo "用法: $0 {start|stop|status|restart|check} [间隔(分钟)]"
    echo ""
    echo "示例:"
    echo "  $0 start       # 启动 (默认30分钟间隔)"
    echo "  $0 start 60    # 启动 (60分钟间隔)"
    echo "  $0 status      # 查看状态"
    echo "  $0 stop        # 停止"
    echo "  $0 check       # 立即检查任务"
    exit 1
    ;;
esac
