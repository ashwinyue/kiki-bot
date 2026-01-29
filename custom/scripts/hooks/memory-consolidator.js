#!/usr/bin/env node
/**
 * Memory Consolidator Hook - 自动整理记忆
 *
 * 在 SessionEnd 时自动运行，整理最近的每日日志到长期记忆
 *
 * 功能：
 * 1. 读取最近 3-7 天的每日日志
 * 2. 提取重要事件、教训、见解
 * 3. 更新 MEMORY.md（提炼的智慧）
 * 4. 可选：更新人格文件（如果发现新模式）
 */

const fs = require('fs');
const path = require('path');

class MemoryConsolidator {
  constructor(workspace) {
    this.workspace = workspace;
    this.memoryDir = path.join(workspace, '.claude/memory');
    this.globalMemoryPath = path.join(workspace, '.claude/MEMORY.md');
    this.personalitiesDir = path.join(workspace, '.claude/personalities');
    this.today = new Date().toISOString().split('T')[0];
  }

  async consolidate() {
    console.error('\n🔄 Memory Consolidator - 开始整理记忆...\n');

    // 1. 检查内存目录
    if (!fs.existsSync(this.memoryDir)) {
      console.error('📝 Memory 目录不存在，跳过整理');
      return;
    }

    // 2. 读取最近的每日日志（过去 7 天）
    const recentLogs = this.getRecentDailyLogs(7);

    if (recentLogs.length === 0) {
      console.error('📝 没有找到最近的每日日志');
      return;
    }

    console.error(`📝 找到 ${recentLogs.length} 个每日日志文件`);

    // 3. 分析日志，提取重要内容
    const insights = this.analyzeLogs(recentLogs);

    if (insights.length === 0) {
      console.error('✅ 没有需要整理的重要内容');
      return;
    }

    console.error(`\n💡 提取了 ${insights.length} 条重要见解`);

    // 4. 更新 MEMORY.md
    await this.updateGlobalMemory(insights);

    console.error('\n✅ 记忆整理完成！\n');
  }

  getRecentDailyLogs(days) {
    const logs = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const logPath = path.join(this.memoryDir, `${dateStr}.md`);

      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        logs.push({
          date: dateStr,
          path: logPath,
          content
        });
      }
    }

    return logs;
  }

  analyzeLogs(logs) {
    const insights = [];

    for (const log of logs) {
      // 查找关键部分
      const sections = {
        insights: this.extractSection(log.content, '## 💡 Insights'),
        decisions: this.extractSection(log.content, '## 🔴 Decisions'),
        issues: this.extractSection(log.content, '## 🐛 Issues'),
        achievements: this.extractSection(log.content, '## ✅ Achievements')
      };

      // 提取重要内容
      if (sections.insights) {
        insights.push({
          type: 'insight',
          date: log.date,
          content: sections.insights
        });
      }

      if (sections.decisions) {
        insights.push({
          type: 'decision',
          date: log.date,
          content: sections.decisions
        });
      }

      if (sections.issues && sections.issues.includes('解决') || sections.issues.includes('fix')) {
        insights.push({
          type: 'lesson',
          date: log.date,
          content: sections.issues
        });
      }

      if (sections.achievements && sections.achievements.length > 50) {
        insights.push({
          type: 'achievement',
          date: log.date,
          content: sections.achievements
        });
      }
    }

    return insights;
  }

  extractSection(content, sectionTitle) {
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = [];
    let depth = 0;

    for (const line of lines) {
      if (line.startsWith(sectionTitle)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        if (line.startsWith('## ')) {
          // 遇到新的同级标题，结束
          break;
        }
        if (line.trim() && !line.startsWith('#')) {
          sectionContent.push(line.trim());
        }
      }
    }

    return sectionContent.length > 0 ? sectionContent.join('\n') : null;
  }

  async updateGlobalMemory(insights) {
    // 确保 MEMORY.md 存在
    this.ensureGlobalMemory();

    let content = fs.readFileSync(this.globalMemoryPath, 'utf8');

    // 按类型分组
    const byType = {
      insight: [],
      decision: [],
      lesson: [],
      achievement: []
    };

    for (const insight of insights) {
      if (byType[insight.type]) {
        byType[insight.type].push(insight);
      }
    }

    // 更新各个章节
    if (byType.decision.length > 0) {
      content = this.appendToSection(content, '## 🔴 Key Decisions', byType.decision);
    }

    if (byType.insight.length > 0) {
      content = this.appendToSection(content, '## 💡 Key Insights', byType.insight);
    }

    if (byType.lesson.length > 0) {
      content = this.appendToSection(content, '## 📚 Lessons Learned', byType.lesson);
    }

    // 写回文件
    fs.writeFileSync(this.globalMemoryPath, content, 'utf8');
    console.error('✅ 已更新 MEMORY.md');
  }

  appendToSection(content, sectionTitle, items) {
    const lines = content.split('\n');
    let sectionIndex = -1;
    let insertIndex = -1;

    // 查找章节位置
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(sectionTitle)) {
        sectionIndex = i;
        // 找到该章节的结束位置（下一个同级标题或文件末尾）
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('## ')) {
            insertIndex = j;
            break;
          }
        }
        if (insertIndex === -1) {
          insertIndex = lines.length;
        }
        break;
      }
    }

    // 如果章节不存在，添加到文件末尾
    if (sectionIndex === -1) {
      const newLines = [sectionTitle, '', ''];
      for (const item of items) {
        newLines.push(`### ${item.date}`);
        newLines.push('');
        newLines.push(item.content.substring(0, 200) + '...');
        newLines.push('');
        newLines.push('---');
        newLines.push('');
      }
      return content + '\n' + newLines.join('\n');
    }

    // 在章节内追加内容
    const newContent = [];
    for (const item of items) {
      newContent.push(`### ${item.date}`);
      newContent.push('');
      newContent.push(item.content.substring(0, 200) + '...');
      newContent.push('');
      newContent.push('---');
      newContent.push('');
    }

    // 插入新内容
    lines.splice(insertIndex, 0, ...newContent);

    return lines.join('\n');
  }

  ensureGlobalMemory() {
    if (!fs.existsSync(this.globalMemoryPath)) {
      const template = `# MEMORY.md - Long-term Memory

> **说明:** 这是人工精选的长期记忆。只包含重要的决策、偏好和持久性事实。
> **维护:** 定期回顾和更新，保持简洁。

## 🔴 Key Decisions

## 👤 User Preferences

## 🏗️ Architecture Notes

## 🔧 Technical Constraints

## 📊 Project Context

## 💡 Key Insights

## 📚 Lessons Learned

---
*最后更新: ${this.today}*
`;
      fs.writeFileSync(this.globalMemoryPath, template, 'utf8');
    }
  }

  printSummary() {
    console.error('\n' + '='.repeat(60));
    console.error('🔄 Memory Consolidator - 记忆整理');
    console.error('='.repeat(60));
    console.error('功能: 自动整理每日日志到长期记忆');
    console.error('触发: SessionEnd 时自动运行');
    console.error('=' + '\n');
  }
}

// Main execution
async function main() {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const consolidator = new MemoryConsolidator(workspace);

  // 仅在显式请求时运行（通过环境变量）
  if (process.env.CONSOLIDATE_MEMORY === 'true') {
    await consolidator.consolidate();
  } else {
    consolidator.printSummary();
  }

  process.exit(0);
}

main().catch(err => {
  console.error(`[MemoryConsolidator] Error: ${err.message}`);
  process.exit(0);
});

module.exports = MemoryConsolidator;
