#!/usr/bin/env node
/**
 * Memory Helper - 记忆管理辅助工具
 *
 * 提供便捷的记忆写入和管理功能
 *
 * 用法：
 *   node memory-helper.js write-daily "内容"
 *   node memory-helper.js write-long-term "内容"
 *   node memory-helper.js extract-decision "决策标题" "决策内容" "理由"
 *   node memory-helper.js extract-lesson "教训标题" "教训内容" "上下文"
 *   node memory-helper.js review-week
 */

const fs = require('fs');
const path = require('path');

class MemoryHelper {
  constructor(workspace) {
    this.workspace = workspace;
    this.claudeDir = path.join(workspace, '.claude');
    this.memoryDir = path.join(this.claudeDir, 'memory');
    this.today = new Date().toISOString().split('T')[0];
    this.dailyLogPath = path.join(this.memoryDir, `${this.today}.md`);
    this.globalMemoryPath = path.join(this.claudeDir, 'MEMORY.md');
  }

  /**
   * 写入今日日志
   */
  writeDailyLog(category, contentText) {
    this.ensureDailyLog();

    const categories = {
      'note': '## 📝 Notes',
      'insight': '## 💡 Insights',
      'issue': '## 🐛 Issues',
      'achievement': '## ✅ Achievements'
    };

    const categoryHeader = categories[category] || '## 📝 Notes';

    // 读取现有内容
    let content = fs.readFileSync(this.dailyLogPath, 'utf8');

    // 检查分类是否存在，不存在则添加
    if (!content.includes(categoryHeader)) {
      content += `\n${categoryHeader}\n\n`;
    }

    // 在分类下添加内容
    const lines = content.split('\n');
    let insertIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === categoryHeader) {
        // 找到下一个分类的起始位置
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^##\s/)) {
            insertIndex = j;
            break;
          }
        }
        break;
      }
    }

    // 插入新内容
    lines.splice(insertIndex, 0, `- ${contentText}`);
    fs.writeFileSync(this.dailyLogPath, lines.join('\n'), 'utf8');

    console.log(`✅ 已写入今日日志 (${category}): ${this.dailyLogPath}`);
  }

  /**
   * 写入长期记忆
   */
  writeLongTermMemory(section, title, memContent) {
    this.ensureGlobalMemory();

    const sections = {
      'decision': '## 🔴 Key Decisions',
      'preference': '## 👤 User Preferences',
      'architecture': '## 🏗️ Architecture Notes',
      'technical': '## 🔧 Technical Constraints',
      'context': '## 📊 Project Context'
    };

    const sectionHeader = sections[section] || '## 📊 Project Context';

    // 读取现有内容
    let memoryContent = fs.readFileSync(this.globalMemoryPath, 'utf8');

    // 检查章节是否存在
    if (!memoryContent.includes(sectionHeader)) {
      memoryContent += `\n${sectionHeader}\n\n`;
    }

    // 添加新条目
    const entry = `\n### ${title}\n\n${memContent}\n\n---\n`;

    // 在章节末尾添加
    const lines = memoryContent.split('\n');
    let insertIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === sectionHeader) {
        // 找到下一个章节的起始位置
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^##\s/)) {
            insertIndex = j;
            break;
          }
        }
        break;
      }
    }

    lines.splice(insertIndex, 0, entry);
    fs.writeFileSync(this.globalMemoryPath, lines.join('\n'), 'utf8');

    console.log(`✅ 已写入长期记忆 (${section}): ${this.globalMemoryPath}`);
  }

  /**
   * 提取决策到长期记忆
   */
  extractDecision(title, decision, rationale) {
    const content = `**Decision:** ${decision}\n\n**Rationale:** ${rationale}`;
    this.writeLongTermMemory('decision', title, content);
  }

  /**
   * 提取教训到长期记忆
   */
  extractLesson(title, lesson, context) {
    const content = `**Lesson:** ${lesson}\n\n**Context:** ${context}`;
    this.writeLongTermMemory('preference', title, content);
  }

  /**
   * 回顾本周记忆
   */
  reviewWeek() {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    console.log(`\n📅 回顾过去 7 天的记忆 (${oneWeekAgo.toISOString().split('T')[0]} - ${this.today})\n`);

    // 列出每日日志
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const logPath = path.join(this.memoryDir, `${dateStr}.md`);

      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.split('\n').filter(line =>
          line.match(/^- /) || line.match(/^##\s/)
        );

        if (lines.length > 0) {
          console.log(`\n📄 ${dateStr}.md:`);
          console.log(lines.slice(0, 20).join('\n')); // 只显示前 20 行
        }
      }
    }

    console.log(`\n💡 提示：使用以下命令提取重要内容到长期记忆`);
    console.log(`   node custom/scripts/memory-helper.js extract-decision "标题" "决策" "理由"`);
    console.log(`   node custom/scripts/memory-helper.js extract-lesson "标题" "教训" "上下文"\n`);
  }

  /**
   * 确保今日日志存在
   */
  ensureDailyLog() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }

    if (!fs.existsSync(this.dailyLogPath)) {
      const template = `# ${this.today} - Daily Log

## 📝 Notes

## 💡 Insights

## 🐛 Issues

## ✅ Achievements
`;
      fs.writeFileSync(this.dailyLogPath, template, 'utf8');
    }
  }

  /**
   * 确保长期记忆存在
   */
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

---
*最后更新: ${this.today}*
`;
      fs.writeFileSync(this.globalMemoryPath, template, 'utf8');
    }
  }
}

// CLI
if (require.main === module) {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const helper = new MemoryHelper(workspace);
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'write-daily':
        const category = args[0] || 'note';
        const content = args[1];
        if (!content) {
          console.error('用法: node memory-helper.js write-daily <category> <content>');
          console.error('分类: note, insight, issue, achievement');
          process.exit(1);
        }
        helper.writeDailyLog(category, content);
        break;

      case 'write-long-term':
        const section = args[0] || 'context';
        const title = args[1];
        const ltContent = args[2];
        if (!title || !ltContent) {
          console.error('用法: node memory-helper.js write-long-term <section> <title> <content>');
          console.error('章节: decision, preference, architecture, technical, context');
          process.exit(1);
        }
        helper.writeLongTermMemory(section, title, ltContent);
        break;

      case 'extract-decision':
        const decTitle = args[0];
        const decision = args[1];
        const rationale = args[2];
        if (!decTitle || !decision || !rationale) {
          console.error('用法: node memory-helper.js extract-decision <title> <decision> <rationale>');
          process.exit(1);
        }
        helper.extractDecision(decTitle, decision, rationale);
        break;

      case 'extract-lesson':
        const lesTitle = args[0];
        const lesson = args[1];
        const context = args[2];
        if (!lesTitle || !lesson || !context) {
          console.error('用法: node memory-helper.js extract-lesson <title> <lesson> <context>');
          process.exit(1);
        }
        helper.extractLesson(lesTitle, lesson, context);
        break;

      case 'review-week':
        helper.reviewWeek();
        break;

      default:
        console.log('Memory Helper - 记忆管理辅助工具\n');
        console.log('用法:');
        console.log('  node memory-helper.js write-daily <category> <content>');
        console.log('  node memory-helper.js write-long-term <section> <title> <content>');
        console.log('  node memory-helper.js extract-decision <title> <decision> <rationale>');
        console.log('  node memory-helper.js extract-lesson <title> <lesson> <context>');
        console.log('  node memory-helper.js review-week\n');
        console.log('示例:');
        console.log('  node memory-helper.js write-daily note "完成用户认证功能"');
        console.log('  node memory-helper.js extract-decision "使用 TypeScript" "项目采用 TypeScript" "类型安全优先"');
        console.log('  node memory-helper.js review-week\n');
        break;
    }
  } catch (err) {
    console.error('错误:', err.message);
    process.exit(1);
  }
}

module.exports = MemoryHelper;
