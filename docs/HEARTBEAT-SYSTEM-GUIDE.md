# HEARTBEAT 系统使用指南

## 📋 系统概述

你的 Everything Claude Code 现在拥有完整的 HEARTBEAT 任务管理系统，类似 Moltbot 的机制：

### ✅ 已实现功能

1. **自动任务提醒**
   - 每次会话开始时显示今日任务概览
   - 每次会话结束时提醒未完成任务
   - 系统通知（macOS/Linux/Windows）

2. **智能状态跟踪**
   - 记录上次会话日期
   - 同一天内只显示一次完整概览
   - 后续会话仅显示快速提醒

3. **任务解析**
   - 自动解析 HEARTBEAT.md 中的所有未完成任务
   - 按类别分组（定时/每日/每周/持续/记忆维护）
   - 支持任务优先级显示

4. **通知系统**
   - SessionStart: 今日任务通知
   - SessionEnd: 未完成任务提醒
   - 跨平台支持（macOS/Linux/Windows）

### ⏸️ 后期实现（定时守护）

- 后台定时检查任务（类似 cron）
- 定期发送主动通知
- 自动执行可执行的任务

## 🚀 快速开始

### 1. 查看 HEARTBEAT.md 任务

```bash
# 查看今日任务
node custom/scripts/heartbeat.js

# 或者直接编辑文件
.claude/personalities/HEARTBEAT.md
```

### 2. 添加新任务

编辑 `.claude/personalities/HEARTBEAT.md`：

```markdown
## 每日检查

- [ ] 检查项目依赖更新
- [ ] 运行测试套件
- [ ] 查看团队通知

## 每周检查

- [ ] 清理未使用的依赖
- [ ] 更新文档
```

### 3. 标记任务完成

```markdown
- [x] 检查项目依赖更新  ← 添加 'x' 标记完成
```

## 🔄 自动触发时机

### SessionStart（会话开始）

```
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
  ...

💡 提示: 使用 "node custom/scripts/heartbeat.js" 查看完整任务列表
======================================================================
```

**触发条件：**
- ✅ 首次会话开始（今天第一次）
- ✅ 同一天内多次会话：显示快速提醒

### SessionEnd（会话结束）

```
======================================================================
💓 HEARTBEAT - 会话结束提醒
======================================================================
📊 还有 7 个待办任务未完成

🔴 高优先级任务（每日检查）:
  1. 检查 pnpm outdated
  2. 运行 pnpm lint
  3. 查看今天的 GitHub 通知

======================================================================
💡 下次会话时将再次提醒
======================================================================
```

**触发条件：**
- ✅ 每次会话结束时
- ✅ 仅当有未完成任务时

## 🔔 系统通知

### macOS

```
💓 今日有 7 个待办任务
打开 HEARTBEAT.md 查看详情
```

### Linux

```bash
# 使用 notify-send
notify-send "💓 今日有 7 个待办任务" "打开 HEARTBEAT.md 查看详情"
```

### Windows

```powershell
# 使用 PowerShell Toast Notification
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier()
```

## 📂 文件结构

```
everything-claude-code/
├── .claude/
│   ├── personalities/
│   │   └── HEARTBEAT.md           # 任务定义文件
│   └── .heartbeat-state.json       # 状态跟踪（自动生成）
│
├── custom/scripts/
│   ├── hooks/
│   │   └── heartbeat-executor.js  # 主执行逻辑
│   ├── heartbeat.js               # CLI 工具
│   └── heartbeat-daemon.js        # 定时守护进程（后期使用）
│
└── hooks/
    └── hooks.json                 # Hook 配置
```

## 🔧 高级用法

### 手动执行检查

```bash
# 显示完整任务列表
node custom/scripts/heartbeat.js

# 执行 SessionStart 检查
HEARTBEAT_MODE=start node custom/scripts/hooks/heartbeat-executor.js

# 执行 SessionEnd 检查
HEARTBEAT_MODE=end node custom/scripts/hooks/heartbeat-executor.js
```

### 启动定时守护（后期）

```bash
# 启动守护进程（每 30 分钟检查一次）
node custom/scripts/heartbeat-daemon.js start 30

# 查看守护状态
node custom/scripts/heartbeat-daemon.js status

# 停止守护
node custom/scripts/heartbeat-daemon.js stop
```

### 可执行任务（未来功能）

在 HEARTBEAT.md 中定义可自动执行的任务：

```markdown
## 每日检查

- [ ] 运行 `pnpm lint`         ← 自动执行命令
- [ ] 检查 `pnpm outdated`      ← 自动执行命令
```

## 📊 状态文件

`.claude/.heartbeat-state.json`（自动生成）：

```json
{
  "lastSessionDate": "2026-01-29"
}
```

**用途：**
- 跟踪上次会话日期
- 避免同一天重复显示完整概览
- 自动维护，无需手动编辑

## 🆚 与 Moltbot 的对比

### Moltbot 的机制

1. **Prompt-based 更新** ✅
   - SOUL.md/AGENTS.md 中有 "Read them. Update them." 指令
   - AI 主动更新人格文件

2. **Heartbeat 定时守护** ✅
   - 后台定时检查 HEARTBEAT.md
   - 定期发送通知
   - 执行可执行的任务

### 你的实现（当前）

1. **Prompt-based 更新** ✅
   - ✅ SOUL.md 有 "Read them. Update them."
   - ✅ AGENTS.md 有记忆维护指令
   - ✅ 所有变体文件已更新

2. **Heartbeat 任务执行** ✅
   - ✅ SessionStart/SessionEnd 自动提醒
   - ✅ 系统通知支持
   - ✅ 任务解析和状态跟踪
   - ⏸️ 定时守护（后期实现）

### 差异总结

| 功能 | Moltbot | 你的实现 |
|------|---------|----------|
| Prompt-based 更新 | ✅ | ✅ |
| SessionStart 提醒 | ✅ | ✅ |
| SessionEnd 提醒 | ✅ | ✅ |
| 系统通知 | ✅ | ✅ |
| 定时守护进程 | ✅ | ⏸️ 后期实现 |
| 自动执行任务 | ✅ | ⏸️ 后期实现 |

## 🎯 最佳实践

### 1. 任务分类

```markdown
## 定时提醒（高频率）
- [ ] 💧 喝水提醒（每30分钟）

## 每日检查（日常维护）
- [ ] 检查依赖更新
- [ ] 运行测试

## 每周检查（周常任务）
- [ ] 清理依赖
- [ ] 更新文档

## 持续关注（长期目标）
- [ ] 关注项目动态
- [ ] 学习新技术
```

### 2. 任务命名

```markdown
# 好的任务描述
- [ ] 检查 pnpm outdated（如果使用 pnpm）
- [ ] 记录今天的重要决策到 memory/YYYY-MM-DD.md

# 避免模糊的描述
- [ ] 检查更新        ← 不够具体
- [ ] 记录决策        ← 缺少位置
```

### 3. 定期回顾

建议每 3-7 天回顾一次 HEARTBEAT.md：
- ✅ 标记已完成的任务
- ✅ 添加新发现的任务
- ✅ 删除过时的任务
- ✅ 调整任务分类

## 🔍 故障排除

### 问题：没有看到任务提醒

**检查：**
1. `.claude/personalities/HEARTBEAT.md` 是否存在
2. hooks.json 是否正确配置
3. Hook 是否有执行权限

**解决方案：**
```bash
# 手动测试
node custom/scripts/hooks/heartbeat-executor.js

# 检查文件权限
chmod +x custom/scripts/hooks/heartbeat-executor.js
```

### 问题：系统通知不显示

**macOS：**
```bash
# 检查通知权限
# 系统偏好设置 → 通知 → Node.js
```

**Linux：**
```bash
# 安装 libnotify
sudo apt-get install libnotify-bin
```

### 问题：每次都显示完整概览

**原因：** `.heartbeat-state.json` 未正确更新

**解决方案：**
```bash
# 删除状态文件，让它重新生成
rm .claude/.heartbeat-state.json
```

## 📝 下一步

### 短期（立即可用）

1. ✅ 编辑 HEARTBEAT.md，添加你的任务
2. ✅ 标记已完成的任务（`[x]`）
3. ✅ 每次会话开始/结束时自动提醒

### 中期（需要时实现）

1. ⏸️ 启动定时守护进程
2. ⏸️ 配置自动执行任务
3. ⏸️ 添加任务优先级

### 长期（未来增强）

1. 🔮 任务依赖关系
2. 🔮 任务完成统计
3. 🔮 自定义通知频率
4. 🔮 集成 GitHub Issues/Jira

## 🎉 总结

你现在拥有：

✅ **自动任务提醒系统**
- 每次会话自动提醒
- 跨平台系统通知

✅ **智能状态跟踪**
- 避免重复提醒
- 记忆上次会话

✅ **灵活的任务管理**
- 简单的 Markdown 格式
- 多类别分组

✅ **与 Moltbot 相当的功能**
- Prompt-based 更新
- HEARTBEAT 任务执行
- 主动通知机制

**唯一缺失的是定时守护进程，这个可以后期按需实现。**

---

*最后更新: 2026-01-29*
