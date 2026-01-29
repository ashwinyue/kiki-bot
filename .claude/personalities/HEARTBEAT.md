# HEARTBEAT.md

## 定时提醒

- [ ] 💧 喝水提醒（每30分钟）

## 每日检查

- [ ] 检查 pnpm outdated (如果 everything-claude-code 使用 pnpm)
- [ ] 运行 pnpm lint
- [ ] 查看今天的 GitHub 通知
- [ ] 记录今天的重要决策到 `memory/YYYY-MM-DD.md`

## 每周检查

- [ ] 更新 README.md
- [ ] 审查最近的代码变更
- [ ] 清理未使用的依赖
- [ ] 整理本周的每日日志到 MEMORY.md（提取重要内容）
- [ ] 更新人格文件（如发现新的工作模式或用户偏好）

## 持续关注

- [ ] 检查是否有安全问题
- [ ] 关注 Claude Code 更新
- [ ] 测试新功能

## 🔄 记忆维护（Memory Maintenance）

**定期执行（建议每 3-7 天）：**

1. **查看最近的每日日志**
   ```bash
   ls -lt .claude/memory/ | head -10
   ```

2. **识别重要内容**
   - 重大决策及理由
   - 用户偏好和习惯
   - 项目架构决策
   - 技术约束和限制
   - 最佳实践和模式

3. **更新 MEMORY.md**
   - 将重要内容添加到相应章节
   - 移除过时信息
   - 保持简洁（提炼的智慧，不是原始日志）

4. **更新人格文件（如需要）**
   - 发现新的工作模式 → 更新 AGENTS.md
   - 了解用户偏好 → 更新 USER.md
   - 意识到核心特质 → 更新 SOUL.md

**记忆维护原则：**
- Daily logs = 原始笔记（what happened）
- MEMORY.md = 提炼的智慧（what matters）
- 像人类回顾日记并更新心智模型一样

**手动触发整理：**
```bash
export CONSOLIDATE_MEMORY=true
# 结束会话时自动整理
```
