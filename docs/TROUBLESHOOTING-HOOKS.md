# SessionStart Hook 错误排查

## 🐛 问题：仍然看到错误

```
⎿  SessionStart:startup hook error
⎿  SessionStart:startup hook error
```

## 🔍 根本原因

**你在错误的目录启动了 Claude Code！**

### 错误的方式

```bash
# ❌ 在 home 目录启动
cd ~
claude

# 或者在任何其他没有 HEARTBEAT 配置的目录
cd /any/other/directory
claude
```

### 正确的方式

```bash
# ✅ 在配置了 HEARTBEAT 的目录启动
cd ~/PycharmProjects/memory-skill/everything-claude-code
claude
```

## 🚀 解决方案

### 方案 1：使用启动脚本（推荐）

```bash
# 进入项目目录
cd ~/PycharmProjects/memory-skill/everything-claude-code

# 使用启动脚本
./claude-with-heartbeat.sh
```

### 方案 2：手动进入目录

```bash
# 进入项目目录
cd ~/PycharmProjects/memory-skill/everything-claude-code

# 启动 Claude Code
claude
```

### 方案 3：创建全局配置（影响所有项目）

如果你想在**任何目录**都看到 HEARTBEAT 提醒，需要配置全局 hooks：

```bash
# 1. 复制配置到全局目录
mkdir -p ~/.claude
cp ~/PycharmProjects/memory-skill/everything-claude-code/hooks/hooks.json ~/.claude/

# 2. 复制脚本到全局目录
mkdir -p ~/.claude/scripts/hooks
cp ~/PycharmProjects/memory-skill/everything-claude-code/custom/scripts/hooks/*.js ~/.claude/scripts/hooks/

# 3. 复制 HEARTBEAT.md 到全局目录
mkdir -p ~/.claude/personalities
cp ~/PycharmProjects/memory-skill/everything-claude-code/.claude/personalities/HEARTBEAT.md ~/.claude/personalities/

# 4. 编辑全局 hooks.json，修改路径
vim ~/.claude/hooks.json
# 将 ${CLAUDE_WORKSPACE} 改为指向实际路径
```

**⚠️ 不推荐方案 3**，因为会让所有项目都使用相同的配置。

## 📂 为什么目录很重要？

HEARTBEAT 功能依赖于**项目目录中的配置文件**：

```
everything-claude-code/
├── .claude/
│   └── personalities/
│       └── HEARTBEAT.md          ← 任务定义文件
│
├── hooks/
│   └── hooks.json                ← Hook 配置
│
└── custom/scripts/hooks/
    ├── heartbeat-executor.js     ← HEARTBEAT 执行器
    ├── personality-switcher.js   ← 人格切换器
    └── memory-consolidator.js    ← 记忆整理器
```

当你在**其他目录**启动 Claude Code 时：
- ❌ 找不到 `hooks/hooks.json`
- ❌ 找不到 `.claude/personalities/HEARTBEAT.md`
- ❌ Hook 执行失败

当你在**配置好的目录**启动时：
- ✅ 找到所有配置文件
- ✅ Hook 正常执行
- ✅ 显示 HEARTBEAT 提醒

## 🧪 验证当前目录

```bash
# 检查当前目录
pwd

# 应该显示：
# /Users/solariswu/PycharmProjects/memory-skill/everything-claude-code

# 检查必要文件是否存在
ls -la .claude/personalities/HEARTBEAT.md
ls -la hooks/hooks.json
ls -la custom/scripts/hooks/heartbeat-executor.js

# 如果都存在，说明在正确的目录
```

## 🎯 推荐工作流程

### 日常使用

```bash
# 1. 进入项目目录
cd ~/PycharmProjects/memory-skill/everything-claude-code

# 2. 启动 Claude Code
./claude-with-heartbeat.sh
# 或
claude

# 3. 看到完整的 HEARTBEAT 提醒
# ======================================================================
# 💓 HEARTBEAT - 今日任务概览
# ======================================================================
# ...
```

### 在其他项目中工作

```bash
# 如果需要在其他项目中使用 HEARTBEAT
cd ~/path/to/other-project

# 方案 A: 复制配置（推荐）
# 1. 复制必要的文件
mkdir -p .claude/personalities hooks custom/scripts/hooks
cp ~/PycharmProjects/memory-skill/everything-claude-code/.claude/personalities/HEARTBEAT.md .claude/personalities/
cp ~/PycharmProjects/memory-skill/everything-claude-code/hooks/hooks.json hooks/
cp ~/PycharmProjects/memory-skill/everything-claude-code/custom/scripts/hooks/*.js custom/scripts/hooks/

# 2. 启动 Claude Code
claude

# 方案 B: 在全局配置中添加（不推荐）
# 会在所有项目中显示相同的 HEARTBEAT
```

## 💡 快速诊断

运行这个脚本来诊断问题：

```bash
cat > /tmp/diagnose-claude.sh << 'EOF'
#!/bin/bash

echo "🔍 Claude Code HEARTBEAT 诊断"
echo "============================"
echo ""

echo "1. 当前目录:"
pwd
echo ""

echo "2. 检查必要文件:"
FILES=(
  ".claude/personalities/HEARTBEAT.md"
  "hooks/hooks.json"
  "custom/scripts/hooks/heartbeat-executor.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (缺失)"
  fi
done

echo ""
echo "3. 检查 hooks.json 配置:"
if [ -f "hooks/hooks.json" ]; then
  node -e "const data=require('./hooks/hooks.json'); console.log('   SessionStart hooks:', data.hooks.SessionStart.length); console.log('   SessionEnd hooks:', data.hooks.SessionEnd.length);" 2>/dev/null || echo "   ❌ hooks.json 格式错误"
else
  echo "   ❌ hooks.json 不存在"
fi

echo ""
echo "4. 建议:"
if [ -f ".claude/personalities/HEARTBEAT.md" ] && [ -f "hooks/hooks.json" ]; then
  echo "   ✅ 配置完整，可以正常启动"
  echo "   运行: claude"
else
  echo "   ❌ 配置不完整，请切换到正确的目录："
  echo "   cd ~/PycharmProjects/memory-skill/everything-claude-code"
  echo "   claude"
fi
EOF

chmod +x /tmp/diagnose-claude.sh
/tmp/diagnose-claude.sh
```

## 📚 总结

### 关键要点

1. ✅ **必须在配置了 HEARTBEAT 的目录启动 Claude Code**
   - 正确：`cd ~/PycharmProjects/memory-skill/everything-claude-code && claude`
   - 错误：`cd ~ && claude`

2. ✅ **使用启动脚本简化流程**
   - `./claude-with-heartbeat.sh`

3. ✅ **检查必要文件是否存在**
   - `.claude/personalities/HEARTBEAT.md`
   - `hooks/hooks.json`
   - `custom/scripts/hooks/heartbeat-executor.js`

### 立即解决

```bash
# 进入正确的目录
cd ~/PycharmProjects/memory-skill/everything-claude-code

# 使用启动脚本
./claude-with-heartbeat.sh
```

**现在应该能看到完整的 HEARTBEAT 提醒了！** 🎉

---

*最后更新: 2026-01-29*
