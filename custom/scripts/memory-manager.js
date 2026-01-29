const fs = require('fs');
const path = require('path');

class MemoryManager {
  constructor(workspace) {
    this.workspace = workspace;
    this.claudeDir = path.join(workspace, '.claude');
    this.personalitiesDir = path.join(this.claudeDir, 'personalities');
    this.memoryDir = path.join(this.claudeDir, 'memory'); // 更新到 .claude/memory/
    this.today = new Date().toISOString().split('T')[0];
    this.globalMemoryPath = path.join(this.claudeDir, 'MEMORY.md');
  }

  init() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
    this.ensureDailyLog();
    this.ensureGlobalMemory();
  }

  ensureDailyLog() {
    const dailyLogPath = path.join(this.memoryDir, `${this.today}.md`);
    if (!fs.existsSync(dailyLogPath)) {
      const template = `# ${this.today} - Daily Log

## 📝 Notes

## 💡 Insights

## 🐛 Issues

## ✅ Achievements
`;
      fs.writeFileSync(dailyLogPath, template, 'utf8');
    }
    return dailyLogPath;
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

---
*最后更新: ${this.today}*
`;
      fs.writeFileSync(this.globalMemoryPath, template, 'utf8');
    }
    return this.globalMemoryPath;
  }

  // 写入决策到全局记忆
  writeDecisionToGlobal(title, decision, rationale, context = '') {
    this.ensureGlobalMemory();
    const content = fs.readFileSync(this.globalMemoryPath, 'utf8');
    
    const decisionsSection = '## 🔴 Key Decisions';
    const newEntry = `\n### ${title}\n\n**Decision:** ${decision}\n\n**Rationale:** ${rationale}\n\n${context ? `**Context:** ${context}\n\n` : ''}---\n`;
    
    if (content.includes(decisionsSection)) {
      const updated = content.replace(
        decisionsSection,
        decisionsSection + newEntry
      );
      fs.writeFileSync(this.globalMemoryPath, updated, 'utf8');
    } else {
      fs.appendFileSync(this.globalMemoryPath, `\n${decisionsSection}${newEntry}`, 'utf8');
    }
  }

  // 写入用户偏好到全局记忆
  writePreference(category, preference, details = '') {
    this.ensureGlobalMemory();
    const content = fs.readFileSync(this.globalMemoryPath, 'utf8');
    
    const prefsSection = '## 👤 User Preferences';
    const newEntry = `\n### ${category}\n\n**Preference:** ${preference}\n\n${details ? `**Details:** ${details}\n\n` : ''}---\n`;
    
    if (content.includes(prefsSection)) {
      const updated = content.replace(
        prefsSection,
        prefsSection + newEntry
      );
      fs.writeFileSync(this.globalMemoryPath, updated, 'utf8');
    } else {
      fs.appendFileSync(this.globalMemoryPath, `\n${prefsSection}${newEntry}`, 'utf8');
    }
  }

  // 写入决策到每日日志
  writeDecision(title, decision, rationale) {
    const dailyLogPath = this.ensureDailyLog();
    const content = `

## 🔴 Decision: ${title}

**Decision:** ${decision}

**Rationale:** ${rationale}

---
`;
    fs.appendFileSync(dailyLogPath, content, 'utf8');
  }

  // 写入教训到每日日志
  writeLesson(title, lesson, context) {
    const dailyLogPath = this.ensureDailyLog();
    const content = `

## 💡 Lesson: ${title}

**Lesson:** ${lesson}

**Context:** ${context}

---
`;
    fs.appendFileSync(dailyLogPath, content, 'utf8');
  }

  // 加载人格文件
  loadPersonalities() {
    const personalities = ['SOUL.md', 'USER.md', 'AGENTS.md', 'HEARTBEAT.md', 'TOOLS.md', 'IDENTITY.md'];
    const results = [];
    for (const file of personalities) {
      const filePath = path.join(this.personalitiesDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        results.push(`# ${file}\n\n${content}`);
      }
    }
    return results.join('\n\n---\n\n');
  }

  // 加载全局记忆
  loadGlobalMemory() {
    if (fs.existsSync(this.globalMemoryPath)) {
      const content = fs.readFileSync(this.globalMemoryPath, 'utf8');
      return `# MEMORY.md (Global Long-term Memory)\n\n${content}`;
    }
    return '';
  }

  // 加载今日日志
  loadTodayLog() {
    const dailyLogPath = path.join(this.memoryDir, `${this.today}.md`);
    const yesterdayLogPath = path.join(this.memoryDir, `${this.getYesterday()}.md`);
    let content = '';

    if (fs.existsSync(dailyLogPath)) {
      content += `# Today's Log (${this.today})\n\n`;
      content += fs.readFileSync(dailyLogPath, 'utf8');
    }

    if (fs.existsSync(yesterdayLogPath)) {
      content += `\n\n# Yesterday's Log (${this.getYesterday()})\n\n`;
      content += fs.readFileSync(yesterdayLogPath, 'utf8');
    }

    return content;
  }

  getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }
}

module.exports = MemoryManager;
