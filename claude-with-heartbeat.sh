#!/bin/bash
# Claude Code 启动脚本 - 带 HEARTBEAT 功能

# 确保在正确的目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 设置工作空间环境变量
export CLAUDE_WORKSPACE="$PROJECT_DIR"

echo "🚀 启动 Claude Code（带 HEARTBEAT 功能）"
echo "==================================="
echo "📁 项目目录: $PROJECT_DIR"
echo ""
echo "💡 启动后会看到："
echo "   - HEARTBEAT 今日任务提醒"
echo "   - 人格模式切换（如适用）"
echo ""
echo "💡 关闭时会看到："
echo "   - 未完成任务提醒"
echo "   - 记忆整理提示"
echo ""
echo "==================================="
echo ""

# 启动 Claude Code
claude
