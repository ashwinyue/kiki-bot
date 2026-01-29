# Memory Auto-Update Guide

## 📋 概述

Everything Claude Code 现在拥有类似 Moltbot 的**记忆自动更新机制**。AI 会在会话期间主动更新人格文件和记忆，确保重要信息不会丢失。

## 🎯 核心原理

### Prompt-based 更新

在每个人格文件中，都有明确的指令告诉 AI：

```markdown
## Continuity

Each session, you wake up fresh. These files *are* your memory.
**Read them. Update them.** They're how you persist.

### 📝 Write It Down - No "Mental Notes"!

- **Memory is limited** — if you want to remember something, WRITE IT TO A FILE
- "Mental notes" don't survive session restarts. Files do.
- When you learn something important → update relevant personality file or memory
- **Text > Brain** 📝
```

### 工作流程

```
SessionStart
  ↓
AI reads all personality files
  ↓
[During Session]
  ↓
AI learns new things → Updates files immediately
  ↓
SessionEnd
  ↓
memory-consolidator.js extracts important content
  ↓
Updates MEMORY.md (long-term wisdom)
```

## 📂 文件结构

### Personality Files（自动更新）

```
.claude/personalities/
├── SOUL.md              # 核心身份和价值观
├── AGENTS.md            # 工作流程和代理编排
├── USER.md              # 用户偏好和习惯
├── HEARTBEAT.md         # 任务清单和提醒
├── IDENTITY.md          # 项目上下文和目标
└── TOOLS.md             # 工具使用指南
```

### Memory Files（自动整理）

```
.claude/memory/
├── 2026-01-29.md        # 每日日志（原始笔记）
├── decisions.md         # 重要决策
├── lessons.md           # 学到的教训
└── patterns.md          # 可复用模式

.claude/
└── MEMORY.md            # 长期记忆（精选智慧）
```

## 🔄 自动更新触发时机

### 1. SessionStart - 读取人格

每次会话开始时，AI 会：

1. **读取所有人格文件**
   - SOUL.md - 了解身份和价值观
   - AGENTS.md - 了解工作流程
   - USER.md - 了解用户偏好
   - HEARTBEAT.md - 了解待办任务
   - MEMORY.md - 了解长期记忆

2. **人格切换**（可选）
   - 根据时间/概率切换到不同模式
   - focus/creative/evil 模式

### 2. During Session - 主动更新

AI 会在以下情况**主动更新文件**：

| 学习内容 | 更新文件 | 示例 |
|---------|---------|------|
| 用户偏好 | USER.md | "用户喜欢 TypeScript 类型注解" |
| 重要决策 | decisions.md | "决定使用 pnpm 而非 npm" |
| 学到的教训 | lessons.md | "不要在循环中调用 API" |
| 发现模式 | patterns.md | "Repository Pattern 统一数据访问" |
| 项目目标 | IDENTITY.md | "构建高性能 API 服务" |
| 工作习惯 | AGENTS.md | "用户喜欢先规划后实现" |

### 3. SessionEnd - 记忆整理

会话结束时，`memory-consolidator.js` 会：

1. **读取最近的每日日志**（过去 3-7 天）
2. **提取重要内容**
   - 重要决策（## 🔴 Decisions）
   - 关键见解（## 💡 Insights）
   - 问题解决（## 🐛 Issues）
   - 成就（## ✅ Achievements）
3. **更新 MEMORY.md**
   - 按类型分类
   - 添加日期标记
   - 保持简洁（只保留重要内容）

## 📝 Daily Logs（每日日志）

### 格式

```markdown
# 2026-01-29

## 🔴 Decisions

- **决定使用 pnpm 作为包管理器**
  - 理由：更快的安装速度，磁盘空间优化
  - 影响：需要更新所有 CI/CD 配置

## 💡 Insights

- Claude Code 的 hook 系统非常强大
- 可以通过 hooks.json 配置自动化任务

## 🐛 Issues

- **问题**: SessionEnd hook 没有触发
  - **原因**: 路径配置错误
  - **解决**: 使用 `${CLAUDE_WORKSPACE}` 环境变量

## ✅ Achievements

- 实现了 HEARTBEAT 任务提醒系统
- 集成了人格自动更新机制
```

### 维护原则

- ✅ **记录重要事件**（决策、问题、见解）
- ✅ **保持原始**（不要过度编辑）
- ✅ **每日更新**（每天一个文件）
- ❌ **不要记录琐事**（"写了 5 行代码" 不重要）

## 🧠 MEMORY.md（长期记忆）

### 格式

```markdown
# MEMORY.md - Long-term Memory

> **说明:** 这是人工精选的长期记忆。只包含重要的决策、偏好和持久性事实。
> **维护:** 定期回顾和更新，保持简洁。

## 🔴 Key Decisions

### 2026-01-29
决定使用 pnpm 作为包管理器。理由：更快的安装速度，磁盘空间优化...

### 2026-01-20
采用 Repository Pattern 统一数据访问层...

## 👤 User Preferences

- 偏好 TypeScript 而非 JavaScript
- 喜欢先规划后实现的工作流程
- 重视代码质量和测试覆盖率

## 🏗️ Architecture Notes

- 项目使用 Next.js App Router
- 数据层采用 Repository Pattern
- 状态管理使用 Zustand

## 🔧 Technical Constraints

- 必须兼容 Node.js 18+
- 需要支持 IE11（客户要求）
- 不能使用外部 API 密钥

## 📊 Project Context

- 目标：构建高性能 API 服务
- 团队规模：3 人
- 时间线：3 个月

## 💡 Key Insights

### 2026-01-29
Claude Code 的 hook 系统非常强大...

### 2026-01-15
早期测试能节省大量调试时间...

## 📚 Lessons Learned

### 2026-01-29
不要在循环中调用 API，应该批量处理...

### 2026-01-10
Always validate user input on the server side...

---
*最后更新: 2026-01-29*
```

### 维护原则

- ✅ **精选内容**（只保留重要的）
- ✅ **定期回顾**（每 3-7 天）
- ✅ **保持简洁**（提炼的智慧，不是原始日志）
- ❌ **不要堆砌**（质量 > 数量）

## 🤖 AI 如何更新文件

### 触发条件

AI 会在以下情况**主动更新文件**：

1. **发现用户偏好**
   ```
   User: "我喜欢详细的注释"
   AI: [更新 USER.md] 用户偏好：喜欢详细的代码注释
   ```

2. **做出重要决策**
   ```
   User: "我们用 PostgreSQL 而非 MongoDB"
   AI: [更新 decisions.md] 决定使用 PostgreSQL...
   ```

3. **解决问题**
   ```
   User: "这个 bug 怎么修？"
   AI: [提供解决方案] → [更新 lessons.md] 问题解决记录
   ```

4. **发现模式**
   ```
   AI: "我注意到你总是先写测试..."
   AI: [更新 patterns.md] 工作模式：TDD 驱动开发
   ```

### 更新流程

```javascript
// AI 内部思考过程（伪代码）

if (learnedSomethingImportant) {
  const fileType = determineFileType(information);

  switch (fileType) {
    case 'user_preference':
      updateFile('USER.md', information);
      break;
    case 'decision':
      updateFile('memory/decisions.md', information);
      break;
    case 'lesson':
      updateFile('memory/lessons.md', information);
      break;
    case 'pattern':
      updateFile('memory/patterns.md', information);
      break;
  }

  // 通知用户
  console.log(`✅ 已更新 ${fileType}: ${information.summary}`);
}
```

## 🛠️ 手动触发整理

虽然系统会自动整理，但你也可以手动触发：

### 方法 1: 环境变量

```bash
export CONSOLIDATE_MEMORY=true
# 结束会话时会自动整理
```

### 方法 2: 直接运行

```bash
node custom/scripts/hooks/memory-consolidator.js
```

### 方法 3: 手动整理

```bash
# 1. 查看最近的每日日志
ls -lt .claude/memory/ | head -10

# 2. 识别重要内容
# 查看 memory/2026-01-29.md

# 3. 更新 MEMORY.md
# 手动提取重要内容到 .claude/MEMORY.md

# 4. 更新人格文件（如需要）
# 如果发现新的工作模式，更新 AGENTS.md
```

## 📊 与 Moltbot 的对比

### Moltbot 的机制

```markdown
## SOUL.md

### Continuity

Each session, you wake up fresh. These files *are* your memory.
**Read them. Update them.** They're how you persist.

If you change this file, tell the user — it's your soul, and they should know.
```

### 你的实现（完全相同）

✅ **Prompt-based 更新** - 完全一致
✅ **"Read them. Update them."** - 完全一致
✅ **主动更新文件** - 完全一致
✅ **SessionStart 读取** - 完全一致
✅ **SessionEnd 整理** - 完全一致

### 差异

| 特性 | Moltbot | 你的实现 |
|-----|---------|----------|
| Prompt-based 更新 | ✅ | ✅ |
| SessionStart 读取 | ✅ | ✅ |
| 主动更新文件 | ✅ | ✅ |
| SessionEnd 整理 | ✅ | ✅ |
| 自动提取重要内容 | ❌ | ✅ memory-consolidator.js |
| 按类型分类 | ❌ | ✅ 自动分类到 MEMORY.md |
| 跨平台支持 | ❌ macOS only | ✅ Win/macOS/Linux |

## 🎯 最佳实践

### 1. 定期回顾

**建议每 3-7 天回顾一次：**

```bash
# 查看最近的每日日志
ls -lt .claude/memory/ | head -10

# 识别需要长期保留的内容
grep -r "## 🔴 Decisions" .claude/memory/
grep -r "## 💡 Insights" .claude/memory/
```

### 2. 保持简洁

MEMORY.md 应该是**提炼的智慧**，不是原始日志：

```markdown
# ❌ 错误：过度详细
## 2026-01-29
今天下午 3 点，我们讨论了是否使用 PostgreSQL。最终决定使用 PostgreSQL，
因为...（500 字详细说明）

# ✅ 正确：简洁有力
## 2026-01-29
决定使用 PostgreSQL（而非 MongoDB）。理由：ACID 支持，复杂查询性能更好。
```

### 3. 分类清晰

使用标准章节标题：

```markdown
## 🔴 Key Decisions      # 重要决策
## 👤 User Preferences     # 用户偏好
## 🏗️ Architecture Notes   # 架构笔记
## 🔧 Technical Constraints # 技术约束
## 📊 Project Context      # 项目上下文
## 💡 Key Insights        # 关键见解
## 📚 Lessons Learned     # 学到的教训
```

### 4. 日期标记

每条内容都标记日期，便于追溯：

```markdown
### 2026-01-29
决定使用 pnpm...

### 2026-01-15
采用 Repository Pattern...
```

## 🔧 故障排除

### 问题：AI 不更新文件

**可能原因：**
1.人格文件中没有明确指令
2. AI 认为内容不够重要

**解决方案：**
```bash
# 检查人格文件
cat .claude/personalities/SOUL.md | grep "Update them"

# 确保有 "Read them. Update them." 指令
```

### 问题：SessionEnd 没有整理记忆

**可能原因：**
1. memory-consolidator.js 未配置到 hooks.json
2. 脚本执行失败

**解决方案：**
```bash
# 检查 hooks.json
cat hooks/hooks.json | grep memory-consolidator

# 手动运行测试
node custom/scripts/hooks/memory-consolidator.js
```

### 问题：MEMORY.md 过于冗长

**解决方案：**
定期清理，只保留真正重要的内容：

```bash
# 备份当前版本
cp .claude/MEMORY.md .claude/MEMORY.md.backup

# 手动精简，移除：
# - 过时信息
# - 重复内容
# - 不重要的细节
```

## 📚 相关文档

- [HEARTBEAT System Guide](HEARTBEAT-SYSTEM-GUIDE.md) - 任务提醒系统
- [Personality Switcher Guide](PERSONALITY-SWITCHER-GUIDE.md) - 人格切换
- [Moltbot Comparison](MOLTBOT-HEARTBEAT-COMPARISON.md) - 与 Moltbot 对比

## 🎉 总结

你现在拥有：

✅ **自动记忆更新**
- AI 主动更新人格文件
- 不再丢失重要信息

✅ **智能记忆整理**
- SessionEnd 自动提取重要内容
- 按类型分类到 MEMORY.md

✅ **完整记忆系统**
- Daily logs（原始笔记）
- MEMORY.md（精选智慧）
- Personality files（行为指南）

✅ **与 Moltbot 相同的机制**
- Prompt-based 更新
- "Read them. Update them."
- 主动文件维护

**核心原则：Text > Brain 📝**

---

*最后更新: 2026-01-29*
