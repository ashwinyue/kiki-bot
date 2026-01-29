# 记忆系统快速参考

## 🎯 自动记录功能（已安装）

### 工作方式
- **触发时机**: 每次响应后（Stop Hook）
- **记录位置**: `.claude/memory/YYYY-MM-DD.md`
- **自动去重**: 避免重复记录相同内容

### 查看记录

```bash
# 查看今日日志
cat .claude/memory/$(date +%Y-%m-%d).md

# 查看所有日志
ls -lh .claude/memory/

# 查看长期记忆
cat .claude/MEMORY.md
```

## 🔧 手动记录重要内容

### 方法 1: MemoryManager API

```bash
node -e "
const MemoryManager = require('./custom/scripts/memory-manager.js');
const manager = new MemoryManager(process.cwd());

// 记录决策
manager.writeDecision('标题', '决策内容', '理由');

// 记录教训
manager.writeLesson('标题', '教训内容', '上下文');
"
```

### 方法 2: 直接编辑

```bash
# 编辑今日日志
vim .claude/memory/$(date +%Y-%m-%d).md
```

## 📝 每日日志格式

```markdown
# 2026-01-29 - Daily Log

## 📝 Notes
- 今天的笔记...

## 💡 Insights
- 重要的见解...

## 🐛 Issues
- 遇到的问题...

## ✅ Achievements
- 完成的任务...

## 📝 Session: 14:58
自动记录的会话内容...
---
```

## 🧠 长期记忆格式

```markdown
# MEMORY.md - Long-term Memory

## 🔴 Key Decisions
重要决策记录...

## 👤 User Preferences
用户偏好...

## 💡 Key Insights
重要见解...

## 📚 Lessons Learned
学到的教训...
```

## 🔄 记忆整理

### 自动整理（SessionEnd）
```bash
# 触发整理
CONSOLIDATE_MEMORY=true
# 然后结束会话
```

### 手动整理
```bash
# 执行记忆整理
CONSOLIDATE_MEMORY=true node custom/scripts/hooks/memory-consolidator.js
```

## 🎨 人格切换

```bash
# 查看当前人格
node custom/scripts/hooks/personality-switcher.js

# 切换到专注模式
PERSONALITY_MODE=focus node custom/scripts/hooks/personality-switcher.js

# 切换到创意模式
PERSONALITY_MODE=creative node custom/scripts/hooks/personality-switcher.js
```

## 💓 HEARTBEAT 任务

```bash
# 查看任务
node custom/scripts/heartbeat.js

# 测试系统
bash custom/scripts/test-heartbeat.sh
```

## 📊 文件位置

```
.claude/
├── memory/                  # 每日日志
│   └── 2026-01-29.md
├── MEMORY.md               # 长期记忆
├── personalities/           # 人格文件
│   ├── HEARTBEAT.md
│   ├── AGENTS.md
│   └── SOUL.md
└── personalities-variants/  # 人格变体
    ├── focus/
    ├── creative/
    └── evil/
```

## ⚡ 常用命令

```bash
# 查看今日日志
cat .claude/memory/$(date +%Y-%m-%d).md

# 查看长期记忆
cat .claude/MEMORY.md

# 查看任务
node custom/scripts/heartbeat.js

# 测试心跳系统
bash custom/scripts/test-heartbeat.sh

# 手动记录
node -e "const m=require('./custom/scripts/memory-manager.js');new m(process.cwd()).writeDecision('test','test','test')"

# 整理记忆
CONSOLIDATE_MEMORY=true node custom/scripts/hooks/memory-consolidator.js
```

