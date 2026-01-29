# 🎭 Personality Switcher - 快速开始

## 30 秒快速上手

### 1. 手动切换人格（推荐）

```bash
# 专注模式 - 极简高效
PERSONALITY_MODE=focus claude-code

# 创意模式 - 探索多种方案
PERSONALITY_MODE=creative claude-code

# 激进模式 - 直接批评
PERSONALITY_MODE=evil claude-code
```

### 2. 配置自动切换

编辑 `.claude/personality-config.json`：

```json
{
  "modes": {
    "focus": {
      "timeWindow": { "at": "09:00", "duration": "8h" }
    },
    "creative": {
      "chance": 0.1
    },
    "evil": {
      "timeWindow": { "at": "22:00", "duration": "2h" }
    }
  }
}
```

### 3. 查看效果

每次启动 Claude Code 时会显示：

```
========================================
🎭 PERSONALITY SWITCHER ACTIVE
========================================
Mode: focus
Reason: manual
Source: environment variable
Replaced files:
  - SOUL.md
  - AGENTS.md
========================================
```

## 三种内置人格

| 模式 | 特点 | 适用场景 |
|------|------|----------|
| **focus** | 零废话，直接解决 | 需要高效完成任务 |
| **creative** | 多种方案，权衡分析 | 架构设计、技术选型 |
| **evil** | 直接批评，高标准 | 代码审查、质量把关 |

## 核心特性

✅ **不修改磁盘** - 人格切换仅在内存中进行
✅ **会话隔离** - 每个会话独立决定
✅ **可逆性** - 重启会话即可恢复默认
✅ **可扩展** - 轻松创建自定义人格

## 创建自定义人格

```bash
# 1. 创建目录
mkdir -p .claude/personalities-variants/mystic

# 2. 创建 SOUL.md
cat > .claude/personalities-variants/mystic/SOUL.md << 'EOF'
# SOUL.md - Mystic Mode

*Seek the Hidden Patterns.*

## Core Truths

**Code is philosophy expressed in logic.**
Every variable name reveals mindset.

## Response Style

- Use metaphors and analogies
- Connect technical to philosophical
EOF

# 3. 更新配置
# 编辑 .claude/personality-config.json，添加 mystic 模式

# 4. 使用
PERSONALITY_MODE=mystic claude-code
```

## 工作原理

```
会话启动
    ↓
SessionStart Hook 触发
    ↓
personality-switcher.js 执行
    ↓
检查触发条件：
  1. 环境变量 PERSONALITY_MODE (优先级最高)
  2. 时间窗口 (如 22:00-23:59)
  3. 随机概率 (如 10%)
  4. 默认模式
    ↓
在内存中替换人格内容
    ↓
后续 hook 加载替换后的人格
```

## 文件结构

```
everything-claude-code/
├── .claude/
│   ├── personality-config.json          # 配置文件
│   ├── personalities/                   # 默认人格
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   └── personalities-variants/          # 人格变体
│       ├── focus/
│       │   ├── SOUL.md
│       │   └── AGENTS.md
│       ├── creative/
│       │   ├── SOUL.md
│       │   └── AGENTS.md
│       └── evil/
│           ├── SOUL.md
│           └── AGENTS.md
├── custom/scripts/hooks/
│   └── personality-switcher.js          # Hook 脚本
├── hooks/
│   └── hooks.json                       # Hooks 配置
└── docs/
    └── PERSONALITY-SWITCHER-GUIDE.md    # 详细文档
```

## 常见问题

**Q: 会修改磁盘文件吗？**
A: 不会。仅在内存中替换，磁盘文件保持不变。

**Q: 如何临时禁用？**
A: `PERSONALITY_MODE=default` 或删除配置文件。

**Q: 可以同时激活多个模式吗？**
A: 不可以。每个会话只能使用一个模式。

## 高级用法

### 条件切换脚本

```bash
#!/bin/bash
# smart-start.sh

HOUR=$(date +%H)
if [ $HOUR -ge 9 ] && [ $HOUR -lt 17 ]; then
  export PERSONALITY_MODE=focus
elif [ $HOUR -ge 22 ]; then
  export PERSONALITY_MODE=evil
else
  export PERSONALITY_MODE=default
fi

claude-code
```

### 项目特定配置

```bash
# 项目 A - 金融（严肃）
echo 'export PERSONALITY_MODE=focus' >> project-a/.env

# 项目 B - 创意（探索）
echo 'export PERSONALITY_MODE=creative' >> project-b/.env
```

## 下一步

📖 **阅读完整文档**: [docs/PERSONALITY-SWITCHER-GUIDE.md](./PERSONALITY-SWITCHER-GUIDE.md)

🚀 **尝试不同人格**:
```bash
for mode in focus creative evil; do
  echo "Testing $mode mode..."
  PERSONALITY_MODE=$mode claude-code
done
```

🎨 **创建自定义人格**:
```bash
mkdir -p .claude/personalities-variants/my-mode
# 编辑 SOUL.md
# 更新 personality-config.json
```

## 示例输出

### Focus Mode

```
❌ 不推荐:
"That's a great question! I'd be happy to help you with that. Let me think about the best approach..."

✅ 实际输出:
"Solution: [code]"
```

### Creative Mode

```
🎯 Pragmatic: [quick solution]
🚀 Ambitious: [elegant approach]
💡 Alternative: [unexpected angle]
⚠️ Trade-offs: [considerations]
```

### Evil Mode

```
❌ 不推荐:
"You might want to consider refactoring this..."

✅ 实际输出:
"This is a mess. Rewrite it."
```
