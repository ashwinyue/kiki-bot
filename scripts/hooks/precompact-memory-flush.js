#!/usr/bin/env node
/**
 * PreCompact Memory Flush Hook
 *
 * 在会话接近自动压缩时触发，提醒模型写入持久记忆
 *
 * 功能：
 * - 在上下文压缩前主动保存重要信息
 * - 使用 NO_REPLY 避免用户看到
 * - 确保重要内容不会因压缩而丢失
 */

const fs = require('fs');
const path = require('path');
const {
  getDateString,
  ensureDir,
  log
} = require('../lib/utils');

async function main() {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const today = getDateString();

  // 检查记忆系统是否存在
  const memoryDir = path.join(workspace, '.claude/memory');
  const dailyLogPath = path.join(memoryDir, `${today}.md`);
  const globalMemoryPath = path.join(workspace, '.claude/MEMORY.md');

  // 如果记忆系统不存在，静默退出
  if (!fs.existsSync(memoryDir)) {
    process.exit(0);
  }

  // 确保今日日志存在
  ensureDir(memoryDir);
  if (!fs.existsSync(dailyLogPath)) {
    const template = `# ${today} - Daily Log

## 📝 Notes

## 💡 Insights

## 🐛 Issues

## ✅ Achievements
`;
    fs.writeFileSync(dailyLogPath, template, 'utf8');
  }

  // 计算待写入的重要内容提示
  const reminder = `

═══════════════════════════════════════════════════════════
💾 MEMORY FLUSH - 会话即将压缩，现在保存持久记忆
═══════════════════════════════════════════════════════════

在上下文压缩前，请考虑将以下内容写入记忆：

📝 今日重要内容 → .claude/memory/${today}.md
  - 关键决策
  - 遇到的问题和解决方案
  - 学到的教训
  - 新发现的偏好

🧠 长期重要内容 → .claude/MEMORY.md
  - 持久性决策
  - 用户偏好
  - 重要架构决策
  - 项目上下文

💡 提示：
  - 如果内容重要但短小，写入 MEMORY.md
  - 如果是日常记录，写入今日日志
  - 如果没有需要保存的内容，回复 NO_REPLY

═══════════════════════════════════════════════════════════
`;

  // 输出提醒（会显示给模型）
  console.error(reminder);

  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompactMemoryFlush] Error:', err.message);
  process.exit(0);
});
