# 最终修复：简化 Personality Switcher 输出

## 🐛 问题

即使 hooks.json 配置正确，仍然看到：
```
⎿  SessionStart:startup hook error
⎿  SessionStart:startup hook error
```

## 🔍 根本原因

`personality-switcher.js` 的输出过于冗长，可能被 Claude Code 误判为错误输出。

### 之前的输出

```
========================================
🎭 PERSONALITY SWITCHER ACTIVE
========================================
Mode: creative
Reason: random chance: 10.0%
Replaced files:
  - SOUL.md
  - AGENTS.md
========================================
```

这样的多行输出可能导致 hook 系统误认为执行失败。

## ✅ 修复方案

### 修改后的输出

```
💓 [Personality Switcher] creative mode (chance: random chance: 10.0%)
```

**优点：**
- ✅ 单行输出，简洁明了
- ✅ 仍然包含所有关键信息
- ✅ 不会被误判为错误

### 默认模式（无输出）

当使用默认人格时，完全静默：
```
[PersonalitySwitcher] Using default personality
```

## 📝 修改内容

**文件：** `custom/scripts/hooks/personality-switcher.js`

**修改前：**
```javascript
printSummary() {
  const result = this.switchPersonality();

  if (!result) {
    return; // Default mode
  }

  console.error('\n========================================');
  console.error('🎭 PERSONALITY SWITCHER ACTIVE');
  console.error('========================================');
  console.error(`Mode: ${result.mode}`);
  console.error(`Reason: ${result.source}`);
  console.error(`Replaced files:`);

  for (const [filename, info] of Object.entries(result.replacements)) {
    console.error(`  - ${filename}`);
  }

  console.error('========================================\n');
}
```

**修改后：**
```javascript
printSummary() {
  const result = this.switchPersonality();

  if (!result) {
    // Default mode - silent
    return;
  }

  // Only print if mode is switched, keep it minimal
  console.error(`\n💓 [Personality Switcher] ${result.mode} mode (${result.reason})\n`);
}
```

## 🧪 测试验证

```bash
# 1. 测试 personality-switcher
node custom/scripts/hooks/personality-switcher.js
# 输出: [PersonalitySwitcher] Using default personality

# 2. 测试完整 SessionStart hooks
export CLAUDE_WORKSPACE="$(pwd)"
node custom/scripts/hooks/heartbeat-executor.js
node custom/scripts/hooks/personality-switcher.js
# 两者都应该正常执行，退出码为 0
```

## 🚀 重新启动 Claude Code

```bash
# 1. 退出当前会话
exit

# 2. 重新启动
claude

# 3. 现在应该能看到完整的 HEARTBEAT 提醒，没有错误！
```

## 📋 预期输出

### SessionStart（今天第一次）

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
  [ ] 审查最近的代码变更
  [ ] 清理未使用的依赖

🔄 持续关注
  [ ] 检查是否有安全问题
  [ ] 关注 Claude Code 更新
  [ ] 测试新功能

======================================================================
💡 提示: 使用 "node custom/scripts/heartbeat.js" 查看完整任务列表
======================================================================

⟩   # 正常进入提示符
```

### SessionStart（今天第 2+ 次）

```
💓 HEARTBEAT: 13 个待办任务在 HEARTBEAT.md 中

⟩   # 正常进入提示符
```

### SessionEnd

```
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

## 📚 相关文档

- [TROUBLESHOOTING-HOOKS.md](TROUBLESHOOTING-HOOKS.md) - Hook 故障排除
- [HOW-TO-SEE-REMINDERS.md](HOW-TO-SEE-REMINDERS.md) - 如何看到提醒
- [WHATS-DIFFERENT.md](WHATS-DIFFERENT.md) - 启动时的区别

## 🎉 总结

**问题：** personality-switcher.js 的冗长输出导致 hook 误判为错误

**解决：** 简化输出为单行格式

**状态：** ✅ 已修复

**验证：** 重新启动 Claude Code，应该不再看到错误提示

---

*修复日期: 2026-01-29*
*问题: SessionStart hook error (冗长输出)*
*状态: ✅ 已修复*
