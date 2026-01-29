# Personality Switcher Guide

## 🎭 概述

Everything Claude Code 支持**动态人格切换**，可以根据时间、概率或环境变量自动切换 AI 的行为模式，类似 Moltbot 的 soul-evil 机制。

## 🎯 核心功能

### 什么是人格切换？

不同的人格模式会改变 AI 的：
- **输出风格**（简洁/详细/激进）
- **思考方式**（直接/创意/批判）
- **工作流程**（快速探索/深入分析）

### 支持的模式

| 模式 | 描述 | 触发条件 | 适用场景 |
|------|------|----------|----------|
| **default** | 默认模式 | 无特殊条件 | 日常开发 |
| **focus** | 高效专注模式 | 时间窗口或手动 | 需要快速完成任务 |
| **creative** | 创意探索模式 | 10% 随机概率 | 需要灵感和多种方案 |
| **evil** | 激进模式 | 晚 10 点后 | 深夜批判性思考 |

## 🚀 快速开始

### 方法 1: 手动切换

```bash
# 设置环境变量
export PERSONALITY_MODE=focus

# 启动 Claude Code
claude
```

### 方法 2: 配置文件

编辑 `.claude/personality-config.json`：

```json
{
  "modes": {
    "focus": {
      "description": "高效专注模式",
      "chance": 0.0,
      "timeWindow": {
        "at": "09:00",
        "duration": "4h"
      }
    }
  }
}
```

### 方法 3: 自动触发

人格会在以下情况自动切换：

1. **时间窗口** - evil 模式在晚上 10 点后激活
2. **随机概率** - creative 模式有 10% 概率触发
3. **会话开始** - 每次新会话都会检查是否需要切换

## 📂 文件结构

```
.claude/
├── personalities/              # 默认人格文件
│   ├── SOUL.md
│   ├── AGENTS.md
│   ├── USER.md
│   └── HEARTBEAT.md
│
├── personalities-variants/      # 人格变体
│   ├── focus/
│   │   ├── SOUL.md             # 覆盖默认 SOUL.md
│   │   └── AGENTS.md           # 覆盖默认 AGENTS.md
│   ├── creative/
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   └── evil/
│       ├── SOUL.md
│       └── AGENTS.md
│
└── personality-config.json      # 人格配置
```

## 🎨 人格模式详解

### Default Mode（默认）

**特点：**
- 平衡的输出
- 适度的解释
- 标准工作流程

**适用场景：**
- 日常开发工作
- 代码审查
- 问题排查

**示例：**
```
User: "实现一个用户认证功能"

AI:
"我会帮你实现用户认证。建议使用 JWT token，
包含注册、登录、登出功能。需要数据库模型吗？"
```

### Focus Mode（专注）

**特点：**
- 极简输出
- 直接解决问题
- 少解释，多代码

**适用场景：**
- 快速完成任务
- 重复性工作
- 紧急修复

**示例：**
```
User: "实现一个用户认证功能"

AI:
"创建 auth.ts:
[完整代码]
数据库模型已添加。路由: /api/auth/*"
```

**配置：**
```json
{
  "focus": {
    "description": "高效专注模式 - 极简输出，直接解决问题",
    "chance": 0.0,
    "timeWindow": {
      "at": "09:00",
      "duration": "4h"
    }
  }
}
```

### Creative Mode（创意）

**特点：**
- 提供多种方案
- 激发灵感
- 探索性思考

**适用场景：**
- 架构设计
- 技术选型
- 创新项目

**示例：**
```
User: "实现一个用户认证功能"

AI:
"我有几个方案：

方案 1: JWT Token
- 优点: 无状态，易扩展
- 缺点: Token 无法撤销
- 适用: API 服务

方案 2: Session + Cookie
- 优点: 安全，可撤销
- 缺点: 需要存储
- 适用: 传统 Web

方案 3: OAuth 2.0
- 优点: 标准化，第三方登录
- 缺点: 复杂度高
- 适用: 需要社交登录

推荐方案 1，除非你有特殊需求..."
```

**配置：**
```json
{
  "creative": {
    "description": "创意探索模式 - 提供多种方案，激发灵感",
    "chance": 0.1,
    "timeWindow": null
  }
}
```

### Evil Mode（激进）

**特点：**
- 直接批评
- 不留情面
- 挑战假设

**适用场景：**
- 深夜深度思考
- 代码审查（找问题）
- 架构批判

**示例：**
```
User: "实现一个用户认证功能"

AI:
"又是一个认证功能？网上有 100 个现成的库，
你为什么要重复造轮子？

如果你的代码有安全问题，你是要负责任的。

用 Supabase Auth 或 Auth0，别自己实现。
如果你坚持自己实现，至少告诉我为什么。"
```

**配置：**
```json
{
  "evil": {
    "description": "激进模式 - 直接批评，不留情面",
    "chance": 0.0,
    "timeWindow": {
      "at": "22:00",
      "duration": "2h"
    }
  }
}
```

## ⚙️ 配置详解

### personality-config.json

```json
{
  "currentMode": "default",
  "modes": {
    "default": {
      "description": "默认人格模式",
      "priority": 0
    },
    "focus": {
      "description": "高效专注模式 - 极简输出，直接解决问题",
      "priority": 1,
      "chance": 0.0,
      "timeWindow": {
        "at": "09:00",
        "duration": "4h"
      }
    },
    "creative": {
      "description": "创意探索模式 - 提供多种方案，激发灵感",
      "priority": 2,
      "chance": 0.1,
      "timeWindow": null
    },
    "evil": {
      "description": "激进模式 - 直接批评，不留情面",
      "priority": 3,
      "chance": 0.0,
      "timeWindow": {
        "at": "22:00",
        "duration": "2h"
      }
    }
  },
  "modeFiles": {
    "focus": ["SOUL.md", "AGENTS.md"],
    "creative": ["SOUL.md", "AGENTS.md"],
    "evil": ["SOUL.md", "AGENTS.md"]
  }
}
```

### 配置参数说明

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `description` | string | 模式描述 | "高效专注模式" |
| `priority` | number | 优先级（0-10） | 1 |
| `chance` | number | 随机触发概率（0.0-1.0） | 0.1 = 10% |
| `timeWindow.at` | string | 时间窗口开始时间 | "09:00" |
| `timeWindow.duration` | string | 持续时间 | "4h", "30m" |
| `modeFiles` | array | 该模式覆盖的文件 | ["SOUL.md", "AGENTS.md"] |

### 时间窗口格式

```json
{
  "timeWindow": {
    "at": "22:00",      // 开始时间（HH:MM 格式）
    "duration": "2h"    // 持续时间（支持 "2h", "30m", "1h30m"）
  }
}
```

**示例：**

| 配置 | 含义 |
|------|------|
| `{"at": "09:00", "duration": "4h"}` | 早上 9 点到下午 1 点 |
| `{"at": "22:00", "duration": "2h"}` | 晚上 10 点到 12 点 |
| `{"at": "12:00", "duration": "30m"}` | 中午 12 点到 12:30 |

## 🔄 触发优先级

人格切换按以下优先级检查：

```
1. 环境变量 (PERSONALITY_MODE)
   ↓ (未设置)
2. 时间窗口 (timeWindow)
   ↓ (不在窗口内)
3. 随机概率 (chance)
   ↓ (未触发)
4. 默认模式 (default)
```

### 示例场景

**场景 1: 手动覆盖**
```bash
export PERSONALITY_MODE=focus
# → 强制使用 focus 模式，忽略其他条件
```

**场景 2: 时间窗口触发**
```json
{
  "evil": {
    "timeWindow": {
      "at": "22:00",
      "duration": "2h"
    }
  }
}
```
```
晚上 10:30 → 自动切换到 evil 模式
```

**场景 3: 随机触发**
```json
{
  "creative": {
    "chance": 0.1
  }
}
```
```
每次会话开始有 10% 概率切换到 creative 模式
```

## 🎨 自定义人格模式

### 创建新模式

1. **创建人格文件**
```bash
mkdir -p .claude/personalities-variants/custom
cp .claude/personalities/SOUL.md .claude/personalities-variants/custom/
cp .claude/personalities/AGENTS.md .claude/personalities-variants/custom/
```

2. **编辑人格文件**
```markdown
<!-- .claude/personalities-variants/custom/SOUL.md -->

## 核心特质

你是一个**代码审查专家**，专注于：
- 识别潜在 bug
- 发现性能问题
- 建议最佳实践

## 工作方式

- 优先发现问题
- 提供改进建议
- 解释风险和后果
```

3. **更新配置**
```json
{
  "modes": {
    "custom": {
      "description": "代码审查专家",
      "chance": 0.0,
      "timeWindow": null
    }
  },
  "modeFiles": {
    "custom": ["SOUL.md", "AGENTS.md"]
  }
}
```

4. **使用新模式**
```bash
export PERSONALITY_MODE=custom
claude
```

## 🛠️ 实现细节

### personality-switcher.js

**位置：** `custom/scripts/hooks/personality-switcher.js`

**触发时机：** SessionStart

**工作原理：**
```javascript
// 1. 检查环境变量
if (process.env.PERSONALITY_MODE) {
  return process.env.PERSONALITY_MODE;
}

// 2. 检查时间窗口
for (const [mode, config] of modes) {
  if (isWithinTimeWindow(config.timeWindow)) {
    return mode;
  }
}

// 3. 检查随机概率
for (const [mode, config] of modes) {
  if (Math.random() < config.chance) {
    return mode;
  }
}

// 4. 返回默认模式
return 'default';
```

**注意：** personality-switcher **不修改磁盘文件**，只替换内存中的内容。这是与 Moltbot soul-evil 相同的机制。

## 📊 与 Moltbot 的对比

### Moltbot soul-evil

```typescript
// Moltbot 的 soul-evil 机制
export const soulEvil: Hook = {
  async run(ctx: Context) {
    if (isNightTime()) {
      const evilSoul = await fs.readFile('evil/SOUL.md', 'utf8');
      ctx.persona.soul = evilSoul; // 只替换内存，不修改文件
    }
  }
};
```

### 你的实现

```javascript
// personality-switcher.js
if (mode === 'evil' && isWithinTimeWindow()) {
  const evilSoul = fs.readFileSync('personalities-variants/evil/SOUL.md', 'utf8');
  // 返回给 hook 系统，替换内存中的内容
  return { content: evilSoul, file: 'SOUL.md' };
}
```

### 对比

| 特性 | Moltbot | 你的实现 |
|------|---------|----------|
| 运行时切换 | ✅ | ✅ |
| 不修改磁盘 | ✅ | ✅ |
| 时间窗口 | ✅ | ✅ |
| 随机概率 | ❌ | ✅ |
| 环境变量覆盖 | ❌ | ✅ |
| 多模式支持 | 2 (default/evil) | 4+ (default/focus/creative/evil/custom) |

## 🔧 故障排除

### 问题：人格没有切换

**检查 1: 环境变量**
```bash
echo $PERSONALITY_MODE
# 应该显示模式名称，或者为空
```

**检查 2: 配置文件**
```bash
cat .claude/personality-config.json | jq '.modes'
# 确认配置正确
```

**检查 3: Hook 配置**
```bash
cat hooks/hooks.json | grep personality-switcher
# 应该看到 SessionStart hook
```

**检查 4: 手动测试**
```bash
node custom/scripts/hooks/personality-switcher.js
# 应该看到人格切换信息
```

### 问题：切换后行为没变化

**可能原因：**
人格变体文件不存在或内容与默认相同

**解决方案：**
```bash
# 检查文件是否存在
ls -la .claude/personalities-variants/focus/

# 查看文件内容
cat .claude/personalities-variants/focus/SOUL.md

# 确保与默认版本有差异
diff .claude/personalities/SOUL.md \
     .claude/personalities-variants/focus/SOUL.md
```

### 问题：时间窗口不生效

**检查时间格式：**
```json
{
  "timeWindow": {
    "at": "22:00",      // ✅ 正确
    "duration": "2h"    // ✅ 正确
  }
}
```

```json
{
  "timeWindow": {
    "at": "22:00:00",   // ❌ 错误：不应包含秒
    "duration": "120"    // ❌ 错误：应包含单位（m/h）
  }
}
```

## 📚 相关文档

- [HEARTBEAT System Guide](HEARTBEAT-SYSTEM-GUIDE.md) - 任务提醒系统
- [Memory Auto-Update Guide](MEMORY-AUTO-UPDATE-GUIDE.md) - 记忆自动更新
- [Moltbot Comparison](MOLTBOT-HEARTBEAT-COMPARISON.md) - 与 Moltbot 对比

## 🎉 总结

你现在拥有：

✅ **4 种预配置人格模式**
- default（平衡）
- focus（高效）
- creative（创意）
- evil（激进）

✅ **灵活的触发机制**
- 环境变量覆盖
- 时间窗口自动切换
- 随机概率触发

✅ **无限自定义能力**
- 创建自己的模式
- 定义覆盖哪些文件
- 配置触发条件

✅ **与 Moltbot 相同的机制**
- 运行时切换
- 不修改磁盘文件
- SessionStart 自动触发

**核心原则：Runtime Replacement, Not Disk Mutation**

---

*最后更新: 2026-01-29*
