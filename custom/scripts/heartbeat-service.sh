#!/bin/bash
# HEARTBEAT Daemon Service Manager
# 管理 HEARTBEAT 定时守护进程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 文件路径
WORKSPACE="${CLAUDE_WORKSPACE:-$(pwd)}"
DAEMON_SCRIPT="$WORKSPACE/custom/scripts/heartbeat-daemon.js"
PID_FILE="$HOME/.heartbeat-daemon.pid"
LOG_FILE="$HOME/.heartbeat-daemon.log"

# 显示帮助
show_help() {
  cat << EOF
💓 HEARTBEAT Daemon Service Manager

用法: $0 <command> [options]

命令:
  start [interval]    启动守护进程（默认间隔: 30 分钟）
  stop               停止守护进程
  restart [interval]  重启守护进程
  status             查看守护进程状态
  logs               查看守护进程日志
  enable             开机自启动（macOS/Linux）
  disable            禁用开机自启动

示例:
  $0 start              # 启动（30 分钟间隔）
  $0 start 15           # 启动（15 分钟间隔）
  $0 start 0.5          # 启动（30 秒间隔，用于测试）
  $0 stop               # 停止
  $0 status             # 状态
  $0 logs               # 日志
  $0 enable             # 开机自启动

间隔格式:
  - 数字 = 分钟（例如: 30 = 30 分钟）
  - 小数 = 分钟（例如: 0.5 = 30 秒）
  - 建议: 30 分钟（生产）, 5 分钟（开发）, 0.5 分钟（测试）

文件位置:
  - PID: $PID_FILE
  - 日志: $LOG_FILE

EOF
}

# 检查依赖
check_dependencies() {
  if [ ! -f "$DAEMON_SCRIPT" ]; then
    echo -e "${RED}❌ 错误: 找不到 heartbeat-daemon.js${NC}"
    echo "   路径: $DAEMON_SCRIPT"
    exit 1
  fi

  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 找不到 node${NC}"
    exit 1
  fi
}

# 启动守护进程
start_daemon() {
  local interval=${1:-30}

  echo -e "${BLUE}💓 启动 HEARTBEAT 守护进程...${NC}"

  # 检查是否已在运行
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
      echo -e "${YELLOW}⚠️  守护进程已在运行 (PID: $pid)${NC}"
      echo -e "   使用 '$0 status' 查看状态"
      echo -e "   使用 '$0 restart' 重启"
      exit 0
    else
      echo -e "${YELLOW}⚠️  清理过期的 PID 文件${NC}"
      rm -f "$PID_FILE"
    fi
  fi

  # 启动守护进程
  node "$DAEMON_SCRIPT" start "$interval"

  # 等待启动
  sleep 1

  # 验证启动
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ 守护进程启动成功${NC}"
      echo -e "   PID: $pid"
      echo -e "   日志: $LOG_FILE"
      echo ""
      echo -e "${BLUE}💡 提示:${NC}"
      echo -e "   - 查看状态: $0 status"
      echo -e "   - 查看日志: $0 logs"
      echo -e "   - 停止守护: $0 stop"
    else
      echo -e "${RED}❌ 守护进程启动失败${NC}"
      exit 1
    fi
  else
    echo -e "${RED}❌ 守护进程启动失败（未找到 PID 文件）${NC}"
    exit 1
  fi
}

# 停止守护进程
stop_daemon() {
  echo -e "${BLUE}💓 停止 HEARTBEAT 守护进程...${NC}"

  if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  守护进程未运行${NC}"
    exit 0
  fi

  local pid=$(cat "$PID_FILE")

  if ! ps -p "$pid" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  守护进程已停止（清理 PID 文件）${NC}"
    rm -f "$PID_FILE"
    exit 0
  fi

  # 停止守护进程
  node "$DAEMON_SCRIPT" stop

  # 等待停止
  sleep 1

  # 验证停止
  if ps -p "$pid" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  守护进程仍在运行，强制终止...${NC}"
    kill -9 "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi

  echo -e "${GREEN}✅ 守护进程已停止${NC}"
}

# 重启守护进程
restart_daemon() {
  local interval=${1:-30}

  echo -e "${BLUE}💓 重启 HEARTBEAT 守护进程...${NC}"

  if [ -f "$PID_FILE" ]; then
    stop_daemon
    sleep 1
  fi

  start_daemon "$interval"
}

# 查看状态
show_status() {
  node "$DAEMON_SCRIPT" status
}

# 查看日志
show_logs() {
  if [ ! -f "$LOG_FILE" ]; then
    echo -e "${YELLOW}⚠️  日志文件不存在${NC}"
    echo "   守护进程可能尚未运行"
    exit 0
  fi

  echo -e "${BLUE}💓 HEARTBEAT 守护进程日志${NC}"
  echo "================================"
  tail -n 50 "$LOG_FILE"
  echo ""
  echo -e "${BLUE}💡 提示: 实时查看日志${NC}"
  echo "   tail -f $LOG_FILE"
}

# 开机自启动（macOS）
enable_macos() {
  echo -e "${BLUE}💓 配置 macOS 开机自启动...${NC}"

  local plist_file="$HOME/Library/LaunchAgents/com.heartbeat.daemon.plist"
  local workspace_path="$WORKSPACE"

  cat > "$plist_file" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.heartbeat.daemon</string>

  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>$workspace_path/custom/scripts/heartbeat-daemon.js</string>
    <string>run</string>
    <string>30</string>
  </array>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>$LOG_FILE</string>

  <key>StandardErrorPath</key>
  <string>$LOG_FILE</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>CLAUDE_WORKSPACE</key>
    <string>$workspace_path</string>
  </dict>

  <key>WorkingDirectory</key>
  <string>$workspace_path</string>
</dict>
</plist>
EOF

  # 加载 launch agent
  launchctl load "$plist_file" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  需要手动加载 launch agent${NC}"
    echo "   运行: launchctl load '$plist_file'"
  }

  echo -e "${GREEN}✅ macOS 开机自启动已配置${NC}"
  echo "   配置文件: $plist_file"
  echo ""
  echo -e "${BLUE}💡 提示:${NC}"
  echo "   - 查看状态: launchctl list | grep heartbeat"
  echo "   - 禁用自启动: $0 disable"
}

# 禁用开机自启动（macOS）
disable_macos() {
  echo -e "${BLUE}💓 禁用 macOS 开机自启动...${NC}"

  local plist_file="$HOME/Library/LaunchAgents/com.heartbeat.daemon.plist"

  if [ ! -f "$plist_file" ]; then
    echo -e "${YELLOW}⚠️  开机自启动未配置${NC}"
    exit 0
  fi

  # 卸载 launch agent
  launchctl unload "$plist_file" 2>/dev/null || true

  # 删除配置文件
  rm -f "$plist_file"

  echo -e "${GREEN}✅ macOS 开机自启动已禁用${NC}"
}

# 开机自启动（Linux）
enable_linux() {
  echo -e "${BLUE}💓 配置 Linux 开机自启动...${NC}"

  local service_file="$HOME/.config/systemd/user/heartbeat-daemon.service"
  local workspace_path="$WORKSPACE"

  mkdir -p "$HOME/.config/systemd/user"

  cat > "$service_file" << EOF
[Unit]
Description=HEARTBEAT Daemon for Everything Claude Code
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node $workspace_path/custom/scripts/heartbeat-daemon.js run 30
Restart=always
RestartSec=10
Environment=CLAUDE_WORKSPACE=$workspace_path
WorkingDirectory=$workspace_path

[Install]
WantedBy=default.target
EOF

  # 重新加载 systemd
  systemctl --user daemon-reload

  # 启用服务
  systemctl --user enable heartbeat-daemon.service

  # 启动服务
  systemctl --user start heartbeat-daemon.service

  echo -e "${GREEN}✅ Linux 开机自启动已配置${NC}"
  echo "   服务文件: $service_file"
  echo ""
  echo -e "${BLUE}💡 提示:${NC}"
  echo "   - 查看状态: systemctl --user status heartbeat-daemon"
  echo "   - 查看日志: journalctl --user -u heartbeat-daemon -f"
  echo "   - 禁用自启动: $0 disable"
}

# 禁用开机自启动（Linux）
disable_linux() {
  echo -e "${BLUE}💓 禁用 Linux 开机自启动...${NC}"

  local service_file="$HOME/.config/systemd/user/heartbeat-daemon.service"

  if [ ! -f "$service_file" ]; then
    echo -e "${YELLOW}⚠️  开机自启动未配置${NC}"
    exit 0
  fi

  # 停止服务
  systemctl --user stop heartbeat-daemon.service 2>/dev/null || true

  # 禁用服务
  systemctl --user disable heartbeat-daemon.service 2>/dev/null || true

  # 删除配置文件
  rm -f "$service_file"

  # 重新加载 systemd
  systemctl --user daemon-reload

  echo -e "${GREEN}✅ Linux 开机自启动已禁用${NC}"
}

# 开机自启动
enable_autostart() {
  local platform=$(uname -s)

  case "$platform" in
    Darwin)
      enable_macos
      ;;
    Linux)
      enable_linux
      ;;
    *)
      echo -e "${RED}❌ 不支持的平台: $platform${NC}"
      echo "   开机自启动仅支持 macOS 和 Linux"
      exit 1
      ;;
  esac
}

# 禁用开机自启动
disable_autostart() {
  local platform=$(uname -s)

  case "$platform" in
    Darwin)
      disable_macos
      ;;
    Linux)
      disable_linux
      ;;
    *)
      echo -e "${RED}❌ 不支持的平台: $platform${NC}"
      exit 1
      ;;
  esac
}

# 主函数
main() {
  check_dependencies

  local command=$1
  shift || true

  case "$command" in
    start)
      start_daemon "$@"
      ;;
    stop)
      stop_daemon
      ;;
    restart)
      restart_daemon "$@"
      ;;
    status)
      show_status
      ;;
    logs)
      show_logs
      ;;
    enable)
      enable_autostart
      ;;
    disable)
      disable_autostart
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      echo -e "${RED}❌ 未知命令: $command${NC}"
      echo ""
      show_help
      exit 1
      ;;
  esac
}

main "$@"
