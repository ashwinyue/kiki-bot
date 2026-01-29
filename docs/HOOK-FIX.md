# 修复 SessionStart Hook 错误

## 🐛 问题描述

启动 Claude Code 时看到错误：
```
⎿  SessionStart:startup hook error
⎿  SessionStart:startup hook error
```

## 🔍 根本原因

`hooks/hooks.json` 中引用了**不存在的文件**：

```json
{
  "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-start.js\""
}
```

这些文件（`session-start.js`、`session-end.js`、`evaluate-session.js`）不在预期位置，导致 hook 执行失败。

## ✅ 修复方案

### 移除的 Hooks

**SessionStart：**
- ❌ 移除了 `session-start.js` hook（不存在）

**SessionEnd：**
- ❌ 移除了 `session-end.js` hook（不存在）
- ❌ 移除了 `evaluate-session.js` hook（不存在）

### 保留的 Hooks

**SessionStart（2 个）：**
1. ✅ `heartbeat-executor.js` - 显示今日任务
2. ✅ `personality-switcher.js` - 人格模式切换

**SessionEnd（2 个）：**
1. ✅ `heartbeat-executor.js` - 提醒未完成任务
2. ✅ `memory-consolidator.js` - 整理每日日志

## 🧪 验证

```bash
# 1. 验证 JSON 格式
python3 -c "import json; json.load(open('hooks/hooks.json'))"
# 输出: ✅ JSON 格式正确

# 2. 验证 hooks 数量
python3 -c "import json; data=json.load(open('hooks/hooks.json')); print('SessionStart:', len(data['hooks']['SessionStart']), 'SessionEnd:', len(data['hooks']['SessionEnd']))"
# 输出: SessionStart: 2 SessionEnd: 2

# 3. 测试每个 hook
HEARTBEAT_MODE=start node custom/scripts/hooks/heartbeat-executor.js
# 输出: 💓 HEARTBEAT: 13 个待办任务

node custom/scripts/hooks/personality-switcher.js
# 输出: [PersonalitySwitcher] Using default personality

node custom/scripts/hooks/memory-consolidator.js
# 输出: 🔄 Memory Consolidator - 记忆整理
```

## 🚀 重新启动 Claude Code

```bash
# 1. 退出当前会话
exit

# 2. 重新启动
claude

# 3. 现在应该能看到：
# ======================================================================
# 💓 HEARTBEAT - 今日任务概览
# ======================================================================
# 📅 日期: 2026-01-29
#
# ⏰ 定时提醒
#   [ ] 💧 喝水提醒（每30分钟）
# ...
# ======================================================================
```

## 📋 当前 Hooks 配置

### SessionStart

```json
"SessionStart": [
  {
    "command": "node \"${CLAUDE_WORKSPACE}/custom/scripts/hooks/heartbeat-executor.js\"",
    "description": "Show today's tasks from HEARTBEAT.md"
  },
  {
    "command": "node \"${CLAUDE_WORKSPACE}/custom/scripts/hooks/personality-switcher.js\"",
    "description": "Switch personality mode based on time/chance/env"
  }
]
```

### SessionEnd

```json
"SessionEnd": [
  {
    "command": "HEARTBEAT_MODE=end node \"${CLAUDE_WORKSPACE}/custom/scripts/hooks/heartbeat-executor.js\"",
    "description": "Remind pending tasks from HEARTBEAT.md"
  },
  {
    "command": "node \"${CLAUDE_WORKSPACE}/custom/scripts/hooks/memory-consolidator.js\"",
    "description": "Consolidate daily logs to MEMORY.md"
  }
]
```

## 💡 为什么移除这些 hooks？

这些 hooks（`session-start.js`、`session-end.js`、`evaluate-session.js`）是从另一个项目（Everything Claude Code）的 hooks 配置中复制过来的，但它们对应的文件不在 `custom/scripts/` 目录下。

**选项：**
1. ✅ **移除**（当前方案）- 保持配置简洁
2. ⏸️ **恢复文件** - 如果需要这些功能，可以从原项目复制

如果需要恢复这些 hooks，可以：

```bash
# 从原项目复制文件
cp /path/to/everything-claude-code/scripts/hooks/session-start.js \
   custom/scripts/hooks/

cp /path/to/everything-claude-code/scripts/hooks/session-end.js \
   custom/scripts/hooks/

cp /path/to/everything-claude-code/scripts/hooks/evaluate-session.js \
   custom/scripts/hooks/

# 然后更新 hooks.json 中的路径为 ${CLAUDE_WORKSPACE}
```

## 📚 相关文档

- [HEARTBEAT-SYSTEM-GUIDE.md](HEARTBEAT-SYSTEM-GUIDE.md) - HEARTBEAT 系统完整指南
- [HOW-TO-SEE-REMINDERS.md](HOW-TO-SEE-REMINDERS.md) - 如何看到提醒
- [WHATS-DIFFERENT.md](WHATS-DIFFERENT.md) - 启动时的区别

---

*修复日期: 2026-01-29*
*问题: SessionStart hook error*
*状态: ✅ 已修复*
