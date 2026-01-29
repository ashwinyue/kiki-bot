#!/bin/bash
# 验证 HEARTBEAT 和 Personality 系统设置

echo "🔍 验证 Everything Claude Code 设置"
echo "=================================="
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  local file="$1"
  local description="$2"

  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $description"
    ((SUCCESS_COUNT++))
    return 0
  else
    echo -e "${RED}❌${NC} $description"
    echo -e "   ${YELLOW}缺少: $file${NC}"
    ((FAIL_COUNT++))
    return 1
  fi
}

check_dir() {
  local dir="$1"
  local description="$2"

  if [ -d "$dir" ]; then
    echo -e "${GREEN}✅${NC} $description"
    ((SUCCESS_COUNT++))
    return 0
  else
    echo -e "${RED}❌${NC} $description"
    echo -e "   ${YELLOW}缺少: $dir${NC}"
    ((FAIL_COUNT++))
    return 1
  fi
}

echo "📋 检查核心文件"
echo "----------------"

check_file ".claude/personalities/SOUL.md" "SOUL.md - 核心人格"
check_file ".claude/personalities/AGENTS.md" "AGENTS.md - 工作流程"
check_file ".claude/personalities/USER.md" "USER.md - 用户偏好"
check_file ".claude/personalities/HEARTBEAT.md" "HEARTBEAT.md - 任务清单"

echo ""
echo "🎭 检查人格变体"
echo "----------------"

check_dir ".claude/personalities-variants/focus" "Focus 模式"
check_dir ".claude/personalities-variants/creative" "Creative 模式"
check_dir ".claude/personalities-variants/evil" "Evil 模式"

echo ""
echo "🔧 检查脚本和 Hooks"
echo "-------------------"

check_file "custom/scripts/hooks/heartbeat-executor.js" "HEARTBEAT 执行器"
check_file "custom/scripts/hooks/personality-switcher.js" "人格切换器"
check_file "custom/scripts/hooks/memory-consolidator.js" "记忆整理器"
check_file "custom/scripts/heartbeat.js" "HEARTBEAT CLI 工具"
check_file "hooks/hooks.json" "Hooks 配置"

echo ""
echo "📚 检查文档"
echo "------------"

check_file "docs/HEARTBEAT-SYSTEM-GUIDE.md" "HEARTBEAT 使用指南"
check_file "docs/MEMORY-AUTO-UPDATE-GUIDE.md" "记忆自动更新指南"
check_file "docs/PERSONALITY-SWITCHER-GUIDE.md" "人格切换指南"

echo ""
echo "🧪 测试 HEARTBEAT 系统"
echo "--------------------"

if [ -f "custom/scripts/heartbeat.js" ]; then
  echo -e "${YELLOW}运行 heartbeat.js...${NC}"
  node custom/scripts/heartbeat.js 2>&1 | head -20
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅${NC} HEARTBEAT 系统运行正常"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}❌${NC} HEARTBEAT 系统运行失败"
    ((FAIL_COUNT++))
  fi
fi

echo ""
echo "📊 检查结果"
echo "==========="
echo -e "${GREEN}成功: $SUCCESS_COUNT${NC}"
echo -e "${RED}失败: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 所有检查通过！系统已正确设置。${NC}"
  echo ""
  echo "🚀 下一步："
  echo "  1. 编辑 .claude/personalities/HEARTBEAT.md 添加你的任务"
  echo "  2. 启动新的 Claude Code 会话测试自动提醒"
  echo "  3. 查看文档了解更多功能："
  echo "     - docs/HEARTBEAT-SYSTEM-GUIDE.md"
  echo "     - docs/MEMORY-AUTO-UPDATE-GUIDE.md"
  echo "     - docs/PERSONALITY-SWITCHER-GUIDE.md"
  exit 0
else
  echo -e "${RED}⚠️  发现 $FAIL_COUNT 个问题，请检查上述错误。${NC}"
  exit 1
fi
