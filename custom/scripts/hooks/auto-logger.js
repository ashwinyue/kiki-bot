#!/usr/bin/env node
/**
 * Auto-Logger Hook - 自动记录会话内容
 *
 * 在 Stop hook 触发时，自动记录当前会话的重要工作
 *
 * 功能：
 * 1. 从 stdin 读取会话上下文（如果可用）
 * 2. 提取重要的决策、见解、问题
 * 3. 自动写入今日日志
 * 4. 智能去重（避免重复记录相同内容）
 */

const fs = require('fs');
const path = require('path');

class AutoLogger {
  constructor(workspace) {
    this.workspace = workspace;
    this.memoryDir = path.join(workspace, '.claude/memory');
    this.today = new Date().toISOString().split('T')[0];
    this.dailyLogPath = path.join(this.memoryDir, `${this.today}.md`);
  }

  async logSession() {
    // 确保记忆目录存在
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }

    // 读取会话上下文（从 stdin）
    let sessionData = '';
    try {
      for await (const chunk of process.stdin) {
        sessionData += chunk.toString();
      }
    } catch (err) {
      // stdin 可能不可用，这是正常的
    }

    // 解析会话数据
    let sessionInfo = null;
    if (sessionData) {
      try {
        sessionInfo = JSON.parse(sessionData);
      } catch (err) {
        // 不是 JSON，忽略
      }
    }

    // 生成今日工作摘要
    const summary = this.generateSessionSummary(sessionInfo);

    // 检查是否已经有内容（去重）
    const shouldWrite = await this.shouldWriteSummary(summary);

    if (!shouldWrite) {
      // 静默退出，避免噪音
      process.exit(0);
    }

    // 写入今日日志
    this.appendToDailyLog(summary);

    // 输出到 stderr（用户可见但不干扰 stdout）
    console.error('\n✅ 已记录今日工作到每日日志\n');
  }

  generateSessionSummary(sessionInfo) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    // 如果有会话信息，尝试提取内容
    if (sessionInfo) {
      // 提取关键信息
      const relevantInfo = this.extractRelevantInfo(sessionInfo);
      if (relevantInfo) {
        return relevantInfo;
      }
    }

    // 默认摘要（如果没有会话信息）
    return {
      time: timeStr,
      type: 'session',
      title: '会话记录',
      content: `在 ${timeStr} 完成了会话工作`
    };
  }

  extractRelevantInfo(sessionInfo) {
    // 尝试从 sessionInfo 中提取有用信息
    const info = {
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'session',
      title: '会话活动',
      content: []
    };

    // 检查是否有工具调用记录
    if (sessionInfo.tool_calls && sessionInfo.tool_calls.length > 0) {
      const tools = new Set();
      sessionInfo.tool_calls.forEach(call => {
        if (call.tool) {
          tools.add(call.tool);
        }
      });

      if (tools.size > 0) {
        info.content.push(`使用的工具: ${Array.from(tools).join(', ')}`);
      }
    }

    // 检查是否有用户消息
    if (sessionInfo.user_messages && sessionInfo.user_messages.length > 0) {
      const lastMessage = sessionInfo.user_messages[sessionInfo.user_messages.length - 1];
      if (lastMessage && lastMessage.content) {
        const preview = lastMessage.content.substring(0, 100);
        info.content.push(`最后请求: ${preview}${lastMessage.content.length > 100 ? '...' : ''}`);
      }
    }

    // 如果没有提取到有用信息，返回 null
    if (info.content.length === 0) {
      return null;
    }

    info.content = info.content.join('\n');
    return info;
  }

  async shouldWriteSummary(summary) {
    // 检查今日日志是否存在
    if (!fs.existsSync(this.dailyLogPath)) {
      return true;
    }

    // 读取现有内容
    const existingContent = fs.readFileSync(this.dailyLogPath, 'utf8');

    // 简单去重：检查是否已经有相似的内容
    if (summary.content && summary.content.length > 20) {
      const contentPreview = summary.content.substring(0, 50);
      if (existingContent.includes(contentPreview)) {
        return false; // 已存在相似内容，不重复记录
      }
    }

    return true;
  }

  appendToDailyLog(summary) {
    // 确保文件存在
    if (!fs.existsSync(this.dailyLogPath)) {
      const template = `# ${this.today} - Daily Log

## 📝 Notes

## 💡 Insights

## 🐛 Issues

## ✅ Achievements

`;
      fs.writeFileSync(this.dailyLogPath, template, 'utf8');
    }

    // 准备要追加的内容
    let newContent = '\n';

    if (summary.type === 'session') {
      newContent += `## 📝 Session: ${summary.time}\n\n`;
      newContent += `${summary.content}\n\n`;
      newContent += `---\n`;
    }

    // 追加到文件
    fs.appendFileSync(this.dailyLogPath, newContent, 'utf8');
  }
}

// 主执行
async function main() {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const logger = new AutoLogger(workspace);

  try {
    await logger.logSession();
  } catch (err) {
    // 静默失败，不影响会话
    console.error(`[AutoLogger] Error: ${err.message}`);
  }

  process.exit(0);
}

main();
