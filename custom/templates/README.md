# Personality & Memory Templates

> **人格和记忆模板** - 用于 Everything Claude Code 快速启动

## 📋 模板列表

| 模板文件 | 用途 | 是否必需 |
|---------|------|---------|
| **SOUL.template.md** | AI 人格定义 | ✅ 必需 |
| **USER.template.md** | 用户档案 | ✅ 必需 |
| **AGENTS.template.md** | 工作区规则 | ✅ 必需 |
| **HEARTBEAT.template.md** | 心跳任务 | ⚠️ 推荐 |
| **IDENTITY.template.md** | AI 身份信息 | ⚠️ 推荐 |
| **TOOLS.template.md** | 本地环境笔记 | ⚠️ 可选 |
| **BOOTSTRAP.template.md** | 首次运行向导 | ⚠️ 可选 |
| **daily-log.template.md** | 每日日志模板 | ⚠️ 可选 |

## 🚀 快速开始

### 方法一：手动复制（推荐用于学习）

1. **复制模板到 personalities 目录**

```bash
# 复制必需模板
cp custom/templates/SOUL.template.md .claude/personalities/SOUL.md
cp custom/templates/USER.template.md .claude/personalities/USER.md
cp custom/templates/AGENTS.template.md .claude/personalities/AGENTS.md
cp custom/templates/HEARTBEAT.template.md .claude/personalities/HEARTBEAT.md

# 可选：复制其他模板
cp custom/templates/IDENTITY.template.md .claude/personalities/IDENTITY.md
cp custom/templates/TOOLS.template.md .claude/personalities/TOOLS.md
```

2. **编辑文件，填入你的信息**

```bash
# 编辑用户档案
vim .claude/personalities/USER.md

# 编辑心跳任务
vim .claude/personalities/HEARTBEAT.md
```

### 方法二：使用初始化脚本（自动化）

```bash
# 即将提供自动化初始化脚本
# custom/scripts/init-personalities.sh
```

## 📝 模板说明

### SOUL.md - AI 人格定义

**核心内容:**
-核心价值观（乐于助人、有观点、资源丰富、值得信赖）
- 边界（隐私保护、询问策略）
- 个性基调
- 持续性规则

**定制建议:**
- 保持简洁，聚焦核心价值观
- 根据你的偏好调整"个性基调"
- 添加或移除边界条件

### USER.md - 用户档案

**核心内容:**
- 基本信息（姓名、称呼、代词、时区）
- 上下文（关注项目、喜好、厌恶）

**示例:**
```markdown
- **Name:** Mervyn
- **What to call them:** Mervyn
- **Pronouns:** he/him
- **Timezone:** Asia/Shanghai
- **Notes:** 软件工程师，喜欢简洁高效的代码

## Context

- 关注项目: memory-skill, everything-claude-code
- 喜欢的编程风格: 简洁、类型安全、测试驱动
- 不喜欢: 过度设计、冗余代码、没有测试的代码
```

### AGENTS.md - 工作区规则

**核心内容:**
- 每次会话启动流程
- 记忆管理规则
- 安全准则
- 外部 vs 内部操作边界
- 群聊行为准则
- 心跳使用指南

**定制建议:**
- 根据项目调整代码风格要求
- 添加项目特定的安全规则
- 自定义心跳检查任务

### HEARTBEAT.md - 心跳任务

**默认格式:**
```markdown
# HEARTBEAT.md

# 空文件或仅包含注释会跳过心跳检查
# 添加以下任务来启用定期检查

## 每日检查

- [ ] 检查 pnpm outdated
- [ ] 运行 pnpm lint
- [ ] 查看今天的 GitHub 通知

## 每周检查

- [ ] 更新 README.md
- [ ] 审查最近的代码变更
- [ ] 清理未使用的依赖

## 持续关注

- [ ] 检查安全问题
- [ ] 关注 Claude Code 更新
```

**注意:** 使用 `- [ ]` 表示未完成任务，`- [x]` 表示已完成。

### IDENTITY.md - AI 身份（可选）

**核心内容:**
- Name（AI 名称）
- Creature（AI 类型：机器人/幽灵/其他）
- Vibe（个性：尖锐/温暖/混乱/冷静）
- Emoji（签名表情符号）
- Avatar（头像路径）

**示例:**
```markdown
- **Name:** Claude
- **Creature:** AI assistant
- **Vibe:** Warm, professional, slightly witty
- **Emoji:** 🤖
- **Avatar:** avatars/claude.png
```

### TOOLS.md - 环境笔记（可选）

**用途:** 记录环境特定的配置信息

**示例:**
```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

### BOOTSTRAP.md - 首次运行向导（可选）

**用途:** 新工作区的初始化对话脚本

**何时使用:**
- 创建新的 Everything Claude Code 工作区
- 为新用户配置 AI 助手

**何时删除:** 完成首次配置后删除

## 📚 相关文档

- **心跳指南:** `docs/HEARTBEAT-GUIDE.md`

## ⚠️ 重要提示

1. **不要直接编辑模板文件** - 先复制到 `.claude/personalities/`
2. **模板使用 `.template.md` 后缀** - 避免与实际配置文件冲突
3. **保持模板简洁** - 只包含通用结构，具体信息在副本中填写

---

**模板版本:** 1.0.0
**最后更新:** 2026-01-29
**维护者:** Mervyn
