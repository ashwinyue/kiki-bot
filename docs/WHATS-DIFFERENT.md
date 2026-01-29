# 启动 Claude Code 和平时有什么不同？

## 🎯 简短回答

**完全一样的启动方式，唯一区别是会看到任务提醒！**

## 📋 对比

### 之前（没有 HEARTBEAT）

```bash
$ cd /path/to/project
$ claude

⟩   # 直接进入提示符，没有任何提醒
```

### 现在（有 HEARTBEAT）

```bash
$ cd /path/to/project
$ claude

======================================================================
💓 HEARTBEAT - 今日任务概览
======================================================================
📅 日期: 2026-01-29

⏰ 定时提醒
  [ ] 💧 喝水提醒（每30分钟）

📅 每日检查
  [ ] 检查 pnpm outdated
  [ ] 运行 pnpm lint
  [ ] 查看今天的 GitHub 通知
  [ ] 记录今天的重要决策

📆 每周检查
  [ ] 更新 README.md
  [ ] 审查最近的代码变更
  [ ] 清理未使用的依赖

🔄 持续关注
  [ ] 检查是否有安全问题
  [ ] 关注 Claude Code 更新
  [ ] 测试新功能

======================================================================
💡 提示: 使用 "node custom/scripts/heartbeat.js" 查看完整任务列表
======================================================================

⟩   # 然后正常进入提示符，使用体验完全一样
```

## ✅ 你不需要做什么

### ❌ 不需要安装任何东西

所有功能都已经配置在 `hooks.json` 中：

```json
"SessionStart": [
  {
    "command": "node \"${CLAUDE_WORKSPACE}/custom/scripts/hooks/heartbeat-executor.js\"",
    "description": "Show today's tasks from HEARTBEAT.md"
  }
]
```

### ❌ 不需要修改启动命令

```bash
# 之前怎么启动，现在还怎么启动
claude

# 或者在任何项目中
cd /path/to/project
claude
```

### ❌ 不需要额外配置

只要项目目录包含：
- `.claude/personalities/HEARTBEAT.md`
- `hooks/hooks.json`（已配置好）

就会自动工作！

## 🚀 立即测试

### 方法 1: 启动新的 Claude Code 会话

```bash
# 1. 进入项目目录
cd /Users/solariswu/PycharmProjects/memory-skill/everything-claude-code

# 2. 启动 Claude Code（如果已经在运行，先退出）
# 在当前会话中输入：
exit

# 3. 重新启动
claude

# 4. 你会立即看到 HEARTBEAT 提醒！
```

### 方法 2: 在其他项目中测试

```bash
# 1. 进入任何项目
cd /path/to/any/project

# 2. 启动 Claude Code
claude

# 3. 不会有 HEARTBEAT 提醒（因为该项目没有配置）
```

## 📂 需要什么文件？

### 最低要求（2 个文件）

```
your-project/
├── .claude/
│   └── personalities/
│       └── HEARTBEAT.md          # 任务定义文件
│
└── hooks/
    └── hooks.json                # Hook 配置（指向 heartbeat-executor.js）
```

### 完整配置（推荐）

```
your-project/
├── .claude/
│   ├── personalities/
│   │   ├── SOUL.md              # 人格文件
│   │   ├── AGENTS.md            # 工作流程
│   │   └── HEARTBEAT.md         # 任务定义 ⭐
│   │
│   └── personality-config.json   # 人格配置（可选）
│
├── hooks/
│   └── hooks.json               # Hook 配置 ⭐
│
└── custom/scripts/hooks/
    ├── heartbeat-executor.js    # HEARTBEAT 执行器 ⭐
    ├── personality-switcher.js  # 人格切换器（可选）
    └── memory-consolidator.js   # 记忆整理器（可选）
```

**⭐ 必需文件**

## 🔄 工作流程

### 首次启动（今天第一次）

```bash
$ claude

======================================================================
💓 HEARTBEAT - 今日任务概览
======================================================================
📅 日期: 2026-01-29

⏰ 定时提醒
  [ ] 💧 喝水提醒（每30分钟）

📅 每日检查
  [ ] 检查 pnpm outdated
  [ ] 运行 pnpm lint
  [ ] 查看今天的 GitHub 通知
  [ ] 记录今天的重要决策

📆 每周检查
  [ ] 更新 README.md
  [ ] 审查最近的代码变更
  [ ] 清理未使用的依赖

🔄 持续关注
  [ ] 检查是否有安全问题
  [ ] 关注 Claude Code 更新
  [ ] 测试新功能

======================================================================
💡 提示: 使用 "node custom/scripts/heartbeat.js" 查看完整任务列表
======================================================================

⟩   # 正常使用 Claude Code
```

### 后续启动（今天第 2+ 次）

```bash
$ claude

💓 HEARTBEAT: 13 个待办任务在 HEARTBEAT.md 中

⟩   # 正常使用 Claude Code
```

### 关闭会话时

```bash
# 在 Claude Code 中输入
exit

# 或按 Ctrl+D

======================================================================
💓 HEARTBEAT - 会话结束提醒
======================================================================
📊 还有 13 个待办任务未完成

🔴 高优先级任务（每日检查）:
  1. 检查 pnpm outdated
  2. 运行 pnpm lint
  3. 查看今天的 GitHub 通知

======================================================================
💡 下次会话时将再次提醒
======================================================================
```

## 🎯 使用建议

### 情况 1: 在 everything-claude-code 项目中

```bash
cd /Users/solariswu/PycharmProjects/memory-skill/everything-claude-code
claude

# ✅ 会看到完整的 HEARTBEAT 提醒
# ✅ 会有人格自动更新
# ✅ 会 SessionEnd 时整理记忆
```

### 情况 2: 在其他项目中

```bash
cd /path/to/other-project
claude

# ❌ 不会看到 HEARTBEAT 提醒（没有配置）
# ❌ 不会有人格自动更新
```

### 情况 3: 想在其他项目使用

**方法 1: 复制配置**

```bash
# 1. 复制 HEARTBEAT.md
mkdir -p other-project/.claude/personalities
cp everything-claude-code/.claude/personalities/HEARTBEAT.md \
   other-project/.claude/personalities/

# 2. 复制 hooks.json
cp -r everything-claude-code/hooks other-project/

# 3. 复制脚本（如果需要）
cp -r everything-claude-code/custom other-project/
```

**方法 2: 使用全局配置**

```bash
# 在 ~/.claude/hooks.json 中配置（影响所有项目）
# 这样所有项目都会有 HEARTBEAT 提醒
```

## 📚 总结

### 启动方式

```bash
# 完全一样！
claude
```

### 唯一区别

| 方面 | 之前 | 现在 |
|------|------|------|
| 启动命令 | `claude` | `claude`（相同） |
| 启动后显示 | 直接进入提示符 | 显示今日任务（1-3 秒） |
| 使用体验 | 正常使用 | 正常使用（完全一样） |
| 关闭时 | 无提示 | 显示未完成任务 |
| 日期切换后 | 无变化 | 新的一天会显示完整任务列表 |

### 核心要点

1. ✅ **不需要安装** - 所有功能已配置在 hooks.json
2. ✅ **不需要修改启动命令** - `claude` 就行
3. ✅ **使用体验完全一样** - 只是多了任务提醒
4. ✅ **可以随时关闭** - 编辑 hooks.json 移除 hook

### 想要关闭提醒？

```bash
# 编辑 hooks.json
vim hooks/hooks.json

# 删除或注释掉 SessionStart 和 SessionEnd 中的 heartbeat-executor.js
# 保存后重新启动 Claude Code 即可
```

---

**简单来说：和平时一样使用，只是会看到任务提醒！**

*最后更新: 2026-01-29*
