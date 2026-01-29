#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * 心跳守护 - 检查 HEARTBEAT.md 中的待办任务
 *
 * 用法：
 * 1. 在会话开始时运行，提醒今日任务
 * 2. 在会话结束时运行，提示未完成任务
 * 3. 手动运行：node custom/scripts/heartbeat.js
 */

class HeartbeatMonitor {
  constructor(workspace) {
    this.workspace = workspace;
    this.heartbeatPath = path.join(workspace, '.claude/personalities/HEARTBEAT.md');
  }

  check() {
    if (!fs.existsSync(this.heartbeatPath)) {
      console.error('💓 HEARTBEAT: 未找到 HEARTBEAT.md，跳过检查');
      return null;
    }

    const content = fs.readFileSync(this.heartbeatPath, 'utf8');
    const lines = content.split('\n');

    const tasks = {
      scheduled: [],
      daily: [],
      weekly: [],
      ongoing: [],
      all: []
    };

    let currentSection = null;

    for (const line of lines) {
      // 检测章节
      if (line.includes('定时提醒') || line.includes('Scheduled')) {
        currentSection = 'scheduled';
        continue;
      } else if (line.includes('每日检查') || line.includes('Daily')) {
        currentSection = 'daily';
        continue;
      } else if (line.includes('每周检查') || line.includes('Weekly')) {
        currentSection = 'weekly';
        continue;
      } else if (line.includes('持续关注') || line.includes('Ongoing')) {
        currentSection = 'ongoing';
        continue;
      }

      // 检测未完成任务
      if (line.match(/^\s*-\s\[\s*\]/)) {
        const task = line.replace(/^\s*-\s\[\s*\]\s*/, '').trim();
        if (task) {
          if (currentSection) {
            tasks[currentSection].push(task);
          }
          tasks.all.push(task);
        }
      }
    }

    return tasks;
  }

  printSummary() {
    const tasks = this.check();

    if (!tasks) {
      return;
    }

    const total = tasks.all.length;

    if (total === 0) {
      console.error('\n💓 HEARTBEAT: 所有任务已完成！\n');
      return;
    }

    console.error('\n💓 HEARTBEAT: 待办任务概览');
    console.error('='.repeat(60));

    if (tasks.scheduled.length > 0) {
      console.error('\n⏰ 定时提醒:');
      tasks.scheduled.forEach((task, i) => {
        console.error(`  ${i + 1}. ${task}`);
      });
    }

    if (tasks.daily.length > 0) {
      console.error('\n📅 每日检查:');
      tasks.daily.forEach((task, i) => {
        console.error(`  ${i + 1}. ${task}`);
      });
    }

    if (tasks.weekly.length > 0) {
      console.error('\n📆 每周检查:');
      tasks.weekly.forEach((task, i) => {
        console.error(`  ${i + 1}. ${task}`);
      });
    }

    if (tasks.ongoing.length > 0) {
      console.error('\n🔄 持续关注:');
      tasks.ongoing.forEach((task, i) => {
        console.error(`  ${i + 1}. ${task}`);
      });
    }

    console.error('\n' + '='.repeat(60));
    console.error(`总计: ${total} 个待办任务\n`);
  }

  printQuickReminder() {
    const tasks = this.check();

    if (!tasks) {
      return;
    }

    const total = tasks.all.length;

    if (total > 0) {
      console.error(`\n💓 HEARTBEAT: ${total} 个待办任务在 HEARTBEAT.md 中\n`);
    }
  }
}

// CLI
if (require.main === module) {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const monitor = new HeartbeatMonitor(workspace);
  monitor.printSummary();
}

module.exports = HeartbeatMonitor;
