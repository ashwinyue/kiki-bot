# AGENTS.md - Workspace Rules

## Project Context

这是 Everything Claude Code 项目的增强版本，提供人格系统、持久记忆和心跳守护功能。

## Code Style

- TypeScript/JavaScript: 优先使用 TypeScript
- 遵循 SOLID、KISS、DRY、YAGNI 原则
- 文件大小: 200-400 行典型,800 行上限
- 错误处理: 必须 try-catch,记录详细错误信息

## Git Workflow

- Commit 格式: `<type>: <description>`
- Type: feat, fix, refactor, docs, test, chore, perf, ci
- 不要推送到 main,使用 PR

## Testing

- 最小覆盖率: 80%
- 使用 TDD: 先写测试,再写实现
- 测试类型: Unit, Integration, E2E

## Memory Management

### Daily Logs
- 重要决策写入 `memory/YYYY-MM-DD.md`
- 每日日志包含: Notes, Insights, Issues, Achievements
- 自动创建今日日志（如不存在）

### Long-Term Memory (MEMORY.md)
- 长期记忆精选到 `MEMORY.md`
- 仅包含重要的决策、偏好和持久性事实
- 定期回顾和更新，保持简洁

### 🔄 Memory Maintenance (自动维护)
**在每次会话结束时，主动执行记忆整理：**

1. **读取最近的每日日志**（过去 3-7 天）
   - 查看 `memory/` 目录中的最近文件
   - 识别重要事件、教训或见解

2. **提取值得长期保留的内容**
   - 重大决策及其理由
   - 用户偏好和习惯
   - 项目架构决策
   - 技术约束和限制
   - 最佳实践和模式

3. **更新 MEMORY.md**
   - 将重要内容添加到相应章节
   - 移除过时信息
   - 保持简洁（不是原始日志，是提炼的智慧）

4. **更新人格文件**（如需要）
   - 如果发现新的工作模式 → 更新 AGENTS.md
   - 如果了解用户偏好 → 更新 USER.md
   - 如果意识到核心特质 → 更新 SOUL.md

**记忆整理原则：**
- Daily logs = 原始笔记（what happened）
- MEMORY.md = 提炼的智慧（what matters）
- 像人类回顾日记并更新心智模型一样

### 📝 Write It Down - No "Mental Notes"!
- **Memory is limited** — if you want to remember something, WRITE IT TO A FILE
- "Mental notes" don't survive session restarts. Files do.
- When someone says "remember this" → update `memory/YYYY-MM-DD.md` or MEMORY.md
- When you learn a lesson → update AGENTS.md, TOOLS.md, or relevant file
- When you make a mistake → document it so future-you doesn't repeat it
- **Text > Brain** 📝
